from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import timedelta
from customers.models import Customer
from projects.models import SurveyProject
from properties.models import Property, PropertyListing
from transactions.models import PropertyTransaction
from expenses.models import Expense


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    total_properties = Property.objects.count()
    active_projects = SurveyProject.objects.filter(status__in=['pending', 'survey_in_progress']).count()
    properties_for_sale = PropertyListing.objects.filter(listing_type='for_sale', status='active').count()
    properties_for_rent = PropertyListing.objects.filter(listing_type='for_rent', status='active').count()

    recent_transactions = PropertyTransaction.objects.select_related('property', 'customer').order_by('-transaction_date')[:5]
    transactions_data = [{
        'id': t.id,
        'property': {'id': t.property.id, 'property_name': t.property.property_name},
        'customer': {'id': t.customer.id, 'name': t.customer.name},
        'transaction_type': t.transaction_type,
        'price': str(t.price),
        'transaction_date': t.transaction_date.isoformat(),
    } for t in recent_transactions]

    recent_projects = SurveyProject.objects.select_related('customer', 'surveyor').order_by('-created_at')[:5]
    projects_data = [{
        'id': p.id,
        'project_name': p.project_name,
        'customer': {'id': p.customer.id, 'name': p.customer.name} if p.customer else None,
        'surveyor': {'id': p.surveyor.id, 'username': p.surveyor.username} if p.surveyor else None,
        'location': p.location,
        'status': p.status,
        'created_at': p.created_at.isoformat(),
    } for p in recent_projects]

    return Response({
        'total_properties': total_properties,
        'active_survey_projects': active_projects,
        'properties_for_sale': properties_for_sale,
        'properties_for_rent': properties_for_rent,
        'recent_transactions': transactions_data,
        'recent_projects': projects_data,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reports_stats(request):
    """Aggregated stats for the Reports charts page."""
    # Monthly revenue (last 6 months)
    six_months_ago = timezone.now().date().replace(day=1) - timedelta(days=150)
    monthly_revenue = (
        PropertyTransaction.objects
        .filter(transaction_date__gte=six_months_ago)
        .annotate(month=TruncMonth('transaction_date'))
        .values('month')
        .annotate(total=Sum('price'), count=Count('id'))
        .order_by('month')
    )
    revenue_chart = [
        {
            'month': r['month'].strftime('%b %Y'),
            'revenue': float(r['total'] or 0),
            'count': r['count'],
        }
        for r in monthly_revenue
    ]

    # Monthly expenses (last 6 months)
    monthly_expenses = (
        Expense.objects
        .filter(expense_date__gte=six_months_ago)
        .annotate(month=TruncMonth('expense_date'))
        .values('month')
        .annotate(total=Sum('amount'))
        .order_by('month')
    )
    expenses_by_month = {e['month'].strftime('%b %Y'): float(e['total'] or 0) for e in monthly_expenses}

    # Merge revenue + expenses into one chart series
    all_months = sorted(set(list(expenses_by_month.keys()) + [r['month'] for r in revenue_chart]))
    revenue_vs_expenses = [
        {
            'month': m,
            'revenue': next((r['revenue'] for r in revenue_chart if r['month'] == m), 0),
            'expenses': expenses_by_month.get(m, 0),
        }
        for m in all_months
    ]

    # Project status breakdown
    project_status = list(
        SurveyProject.objects.values('status').annotate(count=Count('id'))
    )
    status_labels = {
        'pending': 'Pending',
        'survey_in_progress': 'In Progress',
        'submitted_to_land_office': 'Submitted',
        'completed': 'Completed',
    }
    project_chart = [
        {'name': status_labels.get(p['status'], p['status']), 'value': p['count']}
        for p in project_status
    ]

    # Expense breakdown by category
    expense_by_category = list(
        Expense.objects.values('category').annotate(total=Sum('amount'))
    )
    expense_chart = [
        {'name': e['category'].replace('_', ' ').title(), 'value': float(e['total'] or 0)}
        for e in expense_by_category
    ]

    # Totals
    total_revenue = float(PropertyTransaction.objects.aggregate(t=Sum('price'))['t'] or 0)
    total_expenses = float(Expense.objects.aggregate(t=Sum('amount'))['t'] or 0)
    total_customers = Customer.objects.count()
    total_projects = SurveyProject.objects.count()

    return Response({
        'revenue_vs_expenses': revenue_vs_expenses,
        'project_status_chart': project_chart,
        'expense_by_category': expense_chart,
        'totals': {
            'revenue': total_revenue,
            'expenses': total_expenses,
            'profit': total_revenue - total_expenses,
            'customers': total_customers,
            'projects': total_projects,
        },
    })

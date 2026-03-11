from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from customers.models import Customer
from projects.models import SurveyProject
from properties.models import Property, PropertyListing
from transactions.models import PropertyTransaction


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    Get dashboard statistics
    """
    # Count statistics
    total_properties = Property.objects.count()
    active_projects = SurveyProject.objects.filter(status__in=['pending', 'survey_in_progress']).count()
    properties_for_sale = PropertyListing.objects.filter(listing_type='for_sale', status='active').count()
    properties_for_rent = PropertyListing.objects.filter(listing_type='for_rent', status='active').count()
    
    # Recent transactions
    recent_transactions = PropertyTransaction.objects.select_related('property', 'customer').order_by('-transaction_date')[:5]
    transactions_data = [{
        'id': t.id,
        'property': {'id': t.property.id, 'property_name': t.property.property_name},
        'customer': {'id': t.customer.id, 'name': t.customer.name},
        'transaction_type': t.transaction_type,
        'price': str(t.price),
        'transaction_date': t.transaction_date.isoformat(),
    } for t in recent_transactions]
    
    # Recent projects
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

from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from .models import Expense
from .serializers import ExpenseSerializer
from accounts.permissions import IsAdminOrWorker
from notify.models import notify_all_staff


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.select_related('recorded_by').all()
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'category', 'description']
    ordering_fields = ['expense_date', 'amount', 'created_at']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdminOrWorker()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        expense = serializer.save(recorded_by=self.request.user)
        notify_all_staff(
            title=f'New Expense: {expense.title}',
            message=f'UGX {expense.amount:,.0f} recorded for "{expense.title}" ({expense.category}).',
            notif_type='new_expense',
            sender=self.request.user,
            exclude_user=self.request.user,
        )

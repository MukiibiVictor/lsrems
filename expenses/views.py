from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from .models import Expense
from .serializers import ExpenseSerializer
from accounts.permissions import IsAdminOrWorker


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.select_related('recorded_by').all()
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'category', 'description']
    ordering_fields = ['expense_date', 'amount', 'created_at']

    def get_permissions(self):
        # Only admin/worker can create, update, delete
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdminOrWorker()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)

from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from .models import PropertyTransaction
from .serializers import PropertyTransactionSerializer


class PropertyTransactionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Property Transaction CRUD operations
    """
    queryset = PropertyTransaction.objects.all()
    serializer_class = PropertyTransactionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['transaction_date', 'created_at']
    filterset_fields = ['transaction_type', 'customer', 'property']

from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from .models import Customer
from .serializers import CustomerSerializer
from notify.models import notify_all_staff


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email', 'phone']
    ordering_fields = ['created_at', 'name']

    def perform_create(self, serializer):
        customer = serializer.save()
        notify_all_staff(
            title=f'New Customer: {customer.name}',
            message=f'{customer.name} has been added as a new customer.',
            notif_type='new_customer',
            sender=self.request.user,
        )

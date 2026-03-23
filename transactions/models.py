from django.db import models
from properties.models import Property
from customers.models import Customer


class PropertyTransaction(models.Model):
    """
    Property Transaction model for tracking sales and rentals
    """
    TRANSACTION_TYPE_CHOICES = [
        ('sale', 'Sale'),
        ('rental', 'Rental'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='transactions')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=50, choices=TRANSACTION_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    price = models.DecimalField(max_digits=12, decimal_places=2)
    transaction_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'property_transactions'
        ordering = ['-transaction_date']
        verbose_name = 'Property Transaction'
        verbose_name_plural = 'Property Transactions'
    
    def __str__(self):
        return f"{self.property.property_name} - {self.customer.name} - {self.get_transaction_type_display()}"

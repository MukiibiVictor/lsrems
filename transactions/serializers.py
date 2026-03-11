from rest_framework import serializers
from .models import PropertyTransaction
from properties.serializers import PropertySerializer
from customers.serializers import CustomerSerializer


class PropertyTransactionSerializer(serializers.ModelSerializer):
    """
    Serializer for Property Transaction model
    """
    property = PropertySerializer(read_only=True)
    customer = CustomerSerializer(read_only=True)
    property_id = serializers.IntegerField(write_only=True)
    customer_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = PropertyTransaction
        fields = [
            'id', 'property', 'property_id', 'customer', 'customer_id',
            'transaction_type', 'price', 'transaction_date', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

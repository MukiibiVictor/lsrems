from rest_framework import serializers
from .models import Expense
from accounts.serializers import UserSerializer


class ExpenseSerializer(serializers.ModelSerializer):
    recorded_by = UserSerializer(read_only=True)

    class Meta:
        model = Expense
        fields = [
            'id', 'title', 'amount', 'category', 'description',
            'expense_date', 'recorded_by', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'recorded_by', 'created_at', 'updated_at']

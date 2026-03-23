from django.contrib import admin
from .models import Expense

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ['title', 'amount', 'category', 'expense_date', 'recorded_by']
    list_filter = ['category', 'expense_date']
    search_fields = ['title', 'description']

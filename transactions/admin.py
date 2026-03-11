from django.contrib import admin
from .models import PropertyTransaction


@admin.register(PropertyTransaction)
class PropertyTransactionAdmin(admin.ModelAdmin):
    list_display = ['property', 'customer', 'transaction_type', 'price', 'transaction_date']
    list_filter = ['transaction_type', 'transaction_date']
    search_fields = ['property__property_name', 'customer__name']
    ordering = ['-transaction_date']

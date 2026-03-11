from django.contrib import admin
from .models import Property, PropertyListing


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ['property_name', 'location', 'property_type', 'status', 'created_at']
    search_fields = ['property_name', 'location']
    list_filter = ['property_type', 'status', 'created_at']
    ordering = ['-created_at']


@admin.register(PropertyListing)
class PropertyListingAdmin(admin.ModelAdmin):
    list_display = ['property', 'listing_type', 'price', 'status', 'listed_date']
    list_filter = ['listing_type', 'status', 'listed_date']
    ordering = ['-listed_date']

from django.db import models
from projects.models import LandTitle


class Property(models.Model):
    """
    Property model for managing real estate assets
    """
    PROPERTY_TYPE_CHOICES = [
        ('land', 'Land'),
        ('house', 'House'),
        ('commercial', 'Commercial'),
        ('apartment', 'Apartment'),
    ]
    
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('sold', 'Sold'),
        ('rented', 'Rented'),
        ('reserved', 'Reserved'),
    ]
    
    property_name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    size = models.CharField(max_length=100)
    land_title = models.ForeignKey(LandTitle, on_delete=models.SET_NULL, null=True, blank=True, related_name='properties')
    property_type = models.CharField(max_length=50, choices=PROPERTY_TYPE_CHOICES)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='available')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'properties'
        ordering = ['-created_at']
        verbose_name = 'Property'
        verbose_name_plural = 'Properties'
    
    def __str__(self):
        return f"{self.property_name} - {self.location}"


class PropertyListing(models.Model):
    """
    Property Listing model for managing properties for sale or rent
    """
    LISTING_TYPE_CHOICES = [
        ('for_sale', 'For Sale'),
        ('for_rent', 'For Rent'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('sold', 'Sold'),
        ('rented', 'Rented'),
        ('inactive', 'Inactive'),
    ]
    
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='listings')
    listing_type = models.CharField(max_length=50, choices=LISTING_TYPE_CHOICES)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    listed_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='active')
    
    class Meta:
        db_table = 'property_listings'
        ordering = ['-listed_date']
        verbose_name = 'Property Listing'
        verbose_name_plural = 'Property Listings'
    
    def __str__(self):
        return f"{self.property.property_name} - {self.get_listing_type_display()} - ${self.price}"

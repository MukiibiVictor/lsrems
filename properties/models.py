from django.db import models
from django.utils import timezone
from datetime import timedelta
from projects.models import LandTitle


class Property(models.Model):
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
    description = models.TextField(blank=True, default='')
    price = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    land_title = models.ForeignKey(LandTitle, on_delete=models.SET_NULL, null=True, blank=True, related_name='properties')
    property_type = models.CharField(max_length=50, choices=PROPERTY_TYPE_CHOICES)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='available')
    taken_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'properties'
        ordering = ['-created_at']
        verbose_name = 'Property'
        verbose_name_plural = 'Properties'

    def __str__(self):
        return f"{self.property_name} - {self.location}"

    def save(self, *args, **kwargs):
        if self.status in ('sold', 'rented') and not self.taken_at:
            self.taken_at = timezone.now()
        elif self.status == 'available':
            self.taken_at = None
        super().save(*args, **kwargs)

    @property
    def hidden_from_display(self):
        if self.taken_at and self.status in ('sold', 'rented'):
            return timezone.now() > self.taken_at + timedelta(weeks=2)
        return False


class PropertyImage(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='properties/%Y/%m/')
    caption = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_primary = models.BooleanField(default=False)

    class Meta:
        db_table = 'property_images'
        ordering = ['-is_primary', 'uploaded_at']

    def __str__(self):
        return f"{self.property.property_name} - image {self.id}"


class PropertyListing(models.Model):
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
        return f"{self.property.property_name} - {self.get_listing_type_display()} - {self.price}"

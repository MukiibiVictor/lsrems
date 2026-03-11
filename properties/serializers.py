from rest_framework import serializers
from .models import Property, PropertyListing
from projects.serializers import LandTitleSerializer


class PropertySerializer(serializers.ModelSerializer):
    """
    Serializer for Property model
    """
    land_title = LandTitleSerializer(read_only=True)
    land_title_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Property
        fields = [
            'id', 'property_name', 'location', 'size', 'land_title', 'land_title_id',
            'property_type', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PropertyListingSerializer(serializers.ModelSerializer):
    """
    Serializer for Property Listing model
    """
    property = PropertySerializer(read_only=True)
    property_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = PropertyListing
        fields = ['id', 'property', 'property_id', 'listing_type', 'price', 'listed_date', 'status']
        read_only_fields = ['id', 'listed_date']

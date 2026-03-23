from rest_framework import serializers
from .models import Property, PropertyImage, PropertyListing
from projects.serializers import LandTitleSerializer


class PropertyImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PropertyImage
        fields = ['id', 'image', 'image_url', 'caption', 'is_primary', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url if obj.image else None


class PropertySerializer(serializers.ModelSerializer):
    land_title = LandTitleSerializer(read_only=True)
    land_title_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    images = PropertyImageSerializer(many=True, read_only=True)
    hidden_from_display = serializers.ReadOnlyField()
    primary_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            'id', 'property_name', 'location', 'size', 'description', 'price',
            'land_title', 'land_title_id', 'property_type', 'status',
            'taken_at', 'hidden_from_display',
            'images', 'primary_image_url',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'taken_at', 'created_at', 'updated_at']

    def get_primary_image_url(self, obj):
        request = self.context.get('request')
        primary = obj.images.filter(is_primary=True).first() or obj.images.first()
        if primary and primary.image:
            return request.build_absolute_uri(primary.image.url) if request else primary.image.url
        return None


class PropertyListingSerializer(serializers.ModelSerializer):
    property = PropertySerializer(read_only=True)
    property_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = PropertyListing
        fields = ['id', 'property', 'property_id', 'listing_type', 'price', 'listed_date', 'status']
        read_only_fields = ['id', 'listed_date']

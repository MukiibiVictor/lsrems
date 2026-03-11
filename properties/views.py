from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from .models import Property, PropertyListing
from .serializers import PropertySerializer, PropertyListingSerializer


class PropertyViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Property CRUD operations
    """
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['property_name', 'location']
    ordering_fields = ['created_at', 'property_name']
    filterset_fields = ['status', 'property_type']


class PropertyListingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Property Listing CRUD operations
    """
    queryset = PropertyListing.objects.all()
    serializer_class = PropertyListingSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['listed_date', 'price']
    filterset_fields = ['listing_type', 'status']

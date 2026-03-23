from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.utils import timezone
from datetime import timedelta
from .models import Property, PropertyImage, PropertyListing
from .serializers import PropertySerializer, PropertyImageSerializer, PropertyListingSerializer


class PropertyViewSet(viewsets.ModelViewSet):
    serializer_class = PropertySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['property_name', 'location', 'description']
    ordering_fields = ['created_at', 'property_name', 'price']

    def get_queryset(self):
        qs = Property.objects.prefetch_related('images').all()
        status_filter = self.request.query_params.get('status')
        type_filter = self.request.query_params.get('property_type')
        hide_taken = self.request.query_params.get('hide_taken', 'false').lower() == 'true'

        if status_filter:
            qs = qs.filter(status=status_filter)
        if type_filter:
            qs = qs.filter(property_type=type_filter)
        if hide_taken:
            cutoff = timezone.now() - timedelta(weeks=2)
            qs = qs.exclude(status__in=['sold', 'rented'], taken_at__lt=cutoff)
        return qs

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

    @action(detail=True, methods=['post'], url_path='upload-image')
    def upload_image(self, request, pk=None):
        prop = self.get_object()
        image_file = request.FILES.get('image')
        if not image_file:
            return Response({'detail': 'No image provided.'}, status=status.HTTP_400_BAD_REQUEST)
        caption = request.data.get('caption', '')
        is_primary = request.data.get('is_primary', 'false').lower() == 'true'
        if is_primary:
            prop.images.update(is_primary=False)
        img = PropertyImage.objects.create(
            property=prop, image=image_file, caption=caption, is_primary=is_primary
        )
        serializer = PropertyImageSerializer(img, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], url_path='images/(?P<image_id>[^/.]+)')
    def delete_image(self, request, pk=None, image_id=None):
        prop = self.get_object()
        try:
            img = prop.images.get(id=image_id)
            img.image.delete(save=False)
            img.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except PropertyImage.DoesNotExist:
            return Response({'detail': 'Image not found.'}, status=status.HTTP_404_NOT_FOUND)


class PropertyListingViewSet(viewsets.ModelViewSet):
    queryset = PropertyListing.objects.select_related('property').all()
    serializer_class = PropertyListingSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['listed_date', 'price']

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

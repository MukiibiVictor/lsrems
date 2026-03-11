from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import FileResponse
from .models import SurveyProject, ProjectUpdate, LandTitle
from .serializers import SurveyProjectSerializer, ProjectUpdateSerializer, LandTitleSerializer


class SurveyProjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Survey Project CRUD operations
    """
    queryset = SurveyProject.objects.all()
    serializer_class = SurveyProjectSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['project_name', 'location', 'customer__name']
    ordering_fields = ['created_at', 'updated_at']
    filterset_fields = ['status', 'surveyor']
    
    @action(detail=True, methods=['get'])
    def updates(self, request, pk=None):
        """
        Get all updates for a specific project
        """
        project = self.get_object()
        updates = project.updates.all()
        serializer = ProjectUpdateSerializer(updates, many=True)
        return Response(serializer.data)


class ProjectUpdateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Project Update operations
    """
    queryset = ProjectUpdate.objects.all()
    serializer_class = ProjectUpdateSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(updated_by=self.request.user)


class LandTitleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Land Title Document operations
    """
    queryset = LandTitle.objects.all()
    serializer_class = LandTitleSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['project', 'document_type']
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """
        Download land title document
        """
        land_title = self.get_object()
        return FileResponse(
            land_title.document_file.open('rb'),
            as_attachment=True,
            filename=land_title.document_file.name
        )

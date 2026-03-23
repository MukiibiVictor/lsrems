from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import FileResponse
from django.utils import timezone
from .models import SurveyProject, ProjectUpdate, LandTitle
from .serializers import SurveyProjectSerializer, ProjectUpdateSerializer, LandTitleSerializer


class SurveyProjectViewSet(viewsets.ModelViewSet):
    queryset = SurveyProject.objects.all()
    serializer_class = SurveyProjectSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['project_name', 'location', 'customer__name']
    ordering_fields = ['created_at', 'updated_at', 'status']

    @action(detail=False, methods=['get'], url_path='unassigned')
    def unassigned(self, request):
        """Return all projects with no surveyor assigned (pending jobs pool)."""
        qs = SurveyProject.objects.filter(surveyor__isnull=True).order_by('-created_at')
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='my-jobs')
    def my_jobs(self, request):
        """Return projects assigned to the current user that are not yet completed."""
        qs = SurveyProject.objects.filter(
            surveyor=request.user
        ).exclude(status='completed').order_by('-created_at')
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='assign-self')
    def assign_self(self, request, pk=None):
        """Allow a surveyor/worker to assign themselves to an unassigned project."""
        project = self.get_object()
        if project.surveyor is not None:
            return Response(
                {'detail': 'Project is already assigned to someone.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        project.surveyor = request.user
        project.status = 'survey_in_progress'
        project.save()
        serializer = self.get_serializer(project)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='assign')
    def assign(self, request, pk=None):
        """Admin assigns a project to a specific user."""
        project = self.get_object()
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'detail': 'user_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            assignee = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        project.surveyor = assignee
        if project.status == 'pending':
            project.status = 'survey_in_progress'
        project.save()
        serializer = self.get_serializer(project)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='complete')
    def complete(self, request, pk=None):
        """Assigned user confirms they have completed the project."""
        project = self.get_object()
        if project.surveyor != request.user and not request.user.is_staff:
            return Response(
                {'detail': 'Only the assigned surveyor or admin can mark this complete.'},
                status=status.HTTP_403_FORBIDDEN
            )
        notes = request.data.get('notes', '')
        project.status = 'completed'
        project.completion_notes = notes
        project.completed_at = timezone.now()
        project.completed_by = request.user
        project.save()
        # Log a project update
        ProjectUpdate.objects.create(
            project=project,
            status='completed',
            notes=notes or 'Project marked as completed.',
            updated_by=request.user,
        )
        serializer = self.get_serializer(project)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def updates(self, request, pk=None):
        project = self.get_object()
        updates = project.updates.all()
        serializer = ProjectUpdateSerializer(updates, many=True)
        return Response(serializer.data)


class ProjectUpdateViewSet(viewsets.ModelViewSet):
    queryset = ProjectUpdate.objects.all()
    serializer_class = ProjectUpdateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(updated_by=self.request.user)


class LandTitleViewSet(viewsets.ModelViewSet):
    queryset = LandTitle.objects.all()
    serializer_class = LandTitleSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['project', 'document_type']

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        land_title = self.get_object()
        try:
            return FileResponse(
                land_title.document_file.open('rb'),
                as_attachment=True,
                filename=land_title.document_file.name.split('/')[-1],
            )
        except Exception:
            return Response({'detail': 'File not found.'}, status=status.HTTP_404_NOT_FOUND)

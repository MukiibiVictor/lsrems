from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import FileResponse
from django.utils import timezone
from .models import SurveyProject, ProjectUpdate, LandTitle
from .serializers import SurveyProjectSerializer, ProjectUpdateSerializer, LandTitleSerializer
from notify.models import notify_user, notify_all_staff


class SurveyProjectViewSet(viewsets.ModelViewSet):
    queryset = SurveyProject.objects.all()
    serializer_class = SurveyProjectSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['project_name', 'location', 'customer__name']
    ordering_fields = ['created_at', 'updated_at', 'status']

    def perform_create(self, serializer):
        project = serializer.save()
        notify_all_staff(
            title=f'New Project: {project.project_name}',
            message=f'A new survey project "{project.project_name}" in {project.location} has been created.',
            notif_type='new_project',
            sender=self.request.user,
            project_id=project.id,
        )

    def perform_update(self, serializer):
        old = self.get_object()
        old_status = old.status
        project = serializer.save()
        if project.status != old_status:
            notify_all_staff(
                title=f'Project Status Updated: {project.project_name}',
                message=f'"{project.project_name}" status changed from {old_status.replace("_"," ")} to {project.status.replace("_"," ")}.',
                notif_type='project_status',
                sender=self.request.user,
                project_id=project.id,
            )

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
        # Notify all admins/managers that someone claimed the project
        notify_all_staff(
            title=f'Project Claimed: {project.project_name}',
            message=f'{request.user.get_full_name() or request.user.username} has claimed project "{project.project_name}" and started work.',
            notif_type='project_claimed',
            sender=request.user,
            exclude_user=request.user,
            project_id=project.id,
        )
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
        # Notify the assigned user
        notify_user(
            recipient=assignee,
            title=f'You have been assigned: {project.project_name}',
            message=f'You have been assigned to project "{project.project_name}" in {project.location}. Please review and begin work.',
            notif_type='project_assigned',
            sender=request.user,
            project_id=project.id,
        )
        # Notify all other staff
        notify_all_staff(
            title=f'Project Assigned: {project.project_name}',
            message=f'{assignee.get_full_name() or assignee.username} has been assigned to "{project.project_name}".',
            notif_type='project_assigned',
            sender=request.user,
            exclude_user=assignee,
            project_id=project.id,
        )
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
        ProjectUpdate.objects.create(
            project=project,
            status='completed',
            notes=notes or 'Project marked as completed.',
            updated_by=request.user,
        )
        # Notify all staff
        notify_all_staff(
            title=f'Project Completed: {project.project_name}',
            message=f'"{project.project_name}" has been marked as completed by {request.user.get_full_name() or request.user.username}.',
            notif_type='project_completed',
            sender=request.user,
            project_id=project.id,
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

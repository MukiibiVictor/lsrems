from rest_framework import serializers
from .models import SurveyProject, ProjectUpdate, LandTitle, ProjectDeadline
from customers.serializers import CustomerSerializer
from accounts.serializers import UserSerializer


class ProjectDeadlineSerializer(serializers.ModelSerializer):
    assigned_to = UserSerializer(read_only=True)
    assigned_to_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    is_overdue = serializers.ReadOnlyField()
    days_until_due = serializers.ReadOnlyField()

    class Meta:
        model = ProjectDeadline
        fields = [
            'id', 'project', 'deadline_type', 'title', 'description',
            'due_date', 'status', 'reminder_sent', 'reminder_days_before',
            'assigned_to', 'assigned_to_id', 'completed_at', 'is_overdue',
            'days_until_due', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SurveyProjectSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(read_only=True)
    surveyor = UserSerializer(read_only=True)
    customer_id = serializers.IntegerField(write_only=True)
    surveyor_id = serializers.IntegerField(write_only=True, required=False, allow_null=True, default=None)
    deadlines = ProjectDeadlineSerializer(many=True, read_only=True)
    is_overdue = serializers.ReadOnlyField()
    days_until_deadline = serializers.ReadOnlyField()
    needs_reminder = serializers.ReadOnlyField()

    class Meta:
        model = SurveyProject
        fields = [
            'id', 'customer', 'customer_id', 'surveyor', 'surveyor_id',
            'project_name', 'location', 'status', 'priority',
            # Scheduling
            'scheduled_start_date', 'scheduled_end_date',
            'land_office_submission_date', 'expected_completion_date',
            # Deadline config
            'survey_duration_days', 'land_office_processing_days',
            'reminder_days_before', 'enable_reminders',
            # Computed
            'is_overdue', 'days_until_deadline', 'needs_reminder',
            'deadlines',
            'completion_notes', 'completed_at',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProjectUpdateSerializer(serializers.ModelSerializer):
    updated_by = UserSerializer(read_only=True)

    class Meta:
        model = ProjectUpdate
        fields = ['id', 'project', 'status', 'notes', 'updated_by', 'timestamp']
        read_only_fields = ['id', 'timestamp']


class LandTitleSerializer(serializers.ModelSerializer):
    project = SurveyProjectSerializer(read_only=True)
    project_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = LandTitle
        fields = ['id', 'project', 'project_id', 'document_type', 'document_file', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

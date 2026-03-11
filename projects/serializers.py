from rest_framework import serializers
from .models import SurveyProject, ProjectUpdate, LandTitle
from customers.serializers import CustomerSerializer
from accounts.serializers import UserSerializer


class SurveyProjectSerializer(serializers.ModelSerializer):
    """
    Serializer for Survey Project model
    """
    customer = CustomerSerializer(read_only=True)
    surveyor = UserSerializer(read_only=True)
    customer_id = serializers.IntegerField(write_only=True)
    surveyor_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = SurveyProject
        fields = [
            'id', 'customer', 'customer_id', 'surveyor', 'surveyor_id',
            'project_name', 'location', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProjectUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for Project Update model
    """
    updated_by = UserSerializer(read_only=True)
    
    class Meta:
        model = ProjectUpdate
        fields = ['id', 'project', 'status', 'notes', 'updated_by', 'timestamp']
        read_only_fields = ['id', 'timestamp']


class LandTitleSerializer(serializers.ModelSerializer):
    """
    Serializer for Land Title Document model
    """
    project = SurveyProjectSerializer(read_only=True)
    project_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = LandTitle
        fields = ['id', 'project', 'project_id', 'document_type', 'document_file', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

from django.contrib import admin
from .models import SurveyProject, ProjectUpdate, LandTitle


@admin.register(SurveyProject)
class SurveyProjectAdmin(admin.ModelAdmin):
    list_display = ['project_name', 'customer', 'surveyor', 'status', 'created_at']
    search_fields = ['project_name', 'location', 'customer__name']
    list_filter = ['status', 'created_at']
    ordering = ['-created_at']


@admin.register(ProjectUpdate)
class ProjectUpdateAdmin(admin.ModelAdmin):
    list_display = ['project', 'status', 'updated_by', 'timestamp']
    list_filter = ['status', 'timestamp']
    ordering = ['-timestamp']


@admin.register(LandTitle)
class LandTitleAdmin(admin.ModelAdmin):
    list_display = ['project', 'document_type', 'uploaded_at']
    list_filter = ['document_type', 'uploaded_at']
    ordering = ['-uploaded_at']

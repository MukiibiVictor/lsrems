from django.db import models
from django.conf import settings
from customers.models import Customer


class SurveyProject(models.Model):
    """
    Survey Project model for managing land surveying operations
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('survey_in_progress', 'Survey In Progress'),
        ('submitted_to_land_office', 'Submitted to Land Office'),
        ('completed', 'Completed'),
    ]
    
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='projects')
    surveyor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='assigned_projects')
    project_name = models.CharField(max_length=255)
    location = models.TextField()
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'survey_projects'
        ordering = ['-created_at']
        verbose_name = 'Survey Project'
        verbose_name_plural = 'Survey Projects'
    
    def __str__(self):
        return f"{self.project_name} - {self.get_status_display()}"


class ProjectUpdate(models.Model):
    """
    Project Update model for tracking project progress
    """
    project = models.ForeignKey(SurveyProject, on_delete=models.CASCADE, related_name='updates')
    status = models.CharField(max_length=50, choices=SurveyProject.STATUS_CHOICES)
    notes = models.TextField()
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'project_updates'
        ordering = ['-timestamp']
        verbose_name = 'Project Update'
        verbose_name_plural = 'Project Updates'
    
    def __str__(self):
        return f"{self.project.project_name} - {self.get_status_display()} - {self.timestamp}"


class LandTitle(models.Model):
    """
    Land Title Document model for storing survey documents
    """
    DOCUMENT_TYPE_CHOICES = [
        ('survey_map', 'Survey Map'),
        ('land_title', 'Land Title'),
        ('boundary_report', 'Boundary Report'),
    ]
    
    project = models.ForeignKey(SurveyProject, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPE_CHOICES)
    document_file = models.FileField(upload_to='land_titles/%Y/%m/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'land_titles'
        ordering = ['-uploaded_at']
        verbose_name = 'Land Title Document'
        verbose_name_plural = 'Land Title Documents'
    
    def __str__(self):
        return f"{self.project.project_name} - {self.get_document_type_display()}"

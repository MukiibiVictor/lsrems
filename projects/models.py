from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
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
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='projects')
    surveyor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='assigned_projects')
    project_name = models.CharField(max_length=255)
    location = models.TextField()
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pending')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    
    # Scheduling and Deadline Fields
    scheduled_start_date = models.DateField(null=True, blank=True, help_text="When the survey work is scheduled to begin")
    scheduled_end_date = models.DateField(null=True, blank=True, help_text="When the survey work should be completed")
    land_office_submission_date = models.DateField(null=True, blank=True, help_text="When documents were submitted to land office")
    expected_completion_date = models.DateField(null=True, blank=True, help_text="Expected date for final completion")
    
    # Deadline Configuration
    survey_duration_days = models.IntegerField(default=7, help_text="Expected days to complete survey work")
    land_office_processing_days = models.IntegerField(default=30, help_text="Expected days for land office processing")
    
    # Reminder Settings
    reminder_days_before = models.IntegerField(default=3, help_text="Days before deadline to send reminders")
    enable_reminders = models.BooleanField(default=True, help_text="Enable automatic reminders for this project")
    
    # Completion tracking
    completion_notes = models.TextField(blank=True, default='', help_text="Notes added when marking project complete")
    completed_at = models.DateTimeField(null=True, blank=True)
    completed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='completed_projects'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'survey_projects'
        ordering = ['-created_at']
        verbose_name = 'Survey Project'
        verbose_name_plural = 'Survey Projects'
    
    def __str__(self):
        return f"{self.project_name} - {self.get_status_display()}"
    
    @property
    def is_overdue(self):
        """Check if project is overdue based on current status"""
        today = timezone.now().date()
        
        if self.status == 'pending' and self.scheduled_start_date:
            return today > self.scheduled_start_date
        elif self.status == 'survey_in_progress' and self.scheduled_end_date:
            return today > self.scheduled_end_date
        elif self.status == 'submitted_to_land_office' and self.expected_completion_date:
            return today > self.expected_completion_date
        
        return False
    
    @property
    def days_until_deadline(self):
        """Calculate days until next deadline"""
        today = timezone.now().date()
        
        if self.status == 'pending' and self.scheduled_start_date:
            return (self.scheduled_start_date - today).days
        elif self.status == 'survey_in_progress' and self.scheduled_end_date:
            return (self.scheduled_end_date - today).days
        elif self.status == 'submitted_to_land_office' and self.expected_completion_date:
            return (self.expected_completion_date - today).days
        
        return None
    
    @property
    def needs_reminder(self):
        """Check if project needs a reminder notification"""
        if not self.enable_reminders:
            return False
        
        days_until = self.days_until_deadline
        if days_until is not None:
            return days_until <= self.reminder_days_before and days_until >= 0
        
        return False
    
    def calculate_deadlines(self):
        """Auto-calculate deadlines based on scheduled dates and duration settings"""
        if self.scheduled_start_date:
            # Calculate survey end date
            if not self.scheduled_end_date:
                self.scheduled_end_date = self.scheduled_start_date + timedelta(days=self.survey_duration_days)
            
            # Calculate expected completion date (including land office processing)
            if not self.expected_completion_date:
                survey_end = self.scheduled_end_date or (self.scheduled_start_date + timedelta(days=self.survey_duration_days))
                self.expected_completion_date = survey_end + timedelta(days=self.land_office_processing_days)
    
    def save(self, *args, **kwargs):
        # Auto-calculate deadlines if not set
        self.calculate_deadlines()
        super().save(*args, **kwargs)


class ProjectDeadline(models.Model):
    """
    Model to track specific deadlines and milestones for projects
    """
    DEADLINE_TYPE_CHOICES = [
        ('survey_start', 'Survey Start'),
        ('survey_completion', 'Survey Completion'),
        ('document_submission', 'Document Submission'),
        ('land_office_response', 'Land Office Response'),
        ('final_completion', 'Final Completion'),
        ('custom', 'Custom Milestone'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('overdue', 'Overdue'),
    ]
    
    project = models.ForeignKey(SurveyProject, on_delete=models.CASCADE, related_name='deadlines')
    deadline_type = models.CharField(max_length=50, choices=DEADLINE_TYPE_CHOICES)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    due_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Reminder settings
    reminder_sent = models.BooleanField(default=False)
    reminder_days_before = models.IntegerField(default=3)
    
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    completed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='completed_deadlines')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'project_deadlines'
        ordering = ['due_date']
        verbose_name = 'Project Deadline'
        verbose_name_plural = 'Project Deadlines'
    
    def __str__(self):
        return f"{self.project.project_name} - {self.title}"
    
    @property
    def is_overdue(self):
        return timezone.now() > self.due_date and self.status != 'completed'
    
    @property
    def days_until_due(self):
        return (self.due_date.date() - timezone.now().date()).days
    
    def save(self, *args, **kwargs):
        # Auto-update status based on due date
        if self.status != 'completed':
            if timezone.now() > self.due_date:
                self.status = 'overdue'
            elif self.status == 'pending':
                self.status = 'pending'
        
        super().save(*args, **kwargs)


class ProjectReminder(models.Model):
    """
    Model to track sent reminders and schedule future ones
    """
    REMINDER_TYPE_CHOICES = [
        ('deadline_approaching', 'Deadline Approaching'),
        ('overdue', 'Overdue'),
        ('status_update_required', 'Status Update Required'),
        ('document_required', 'Document Required'),
        ('custom', 'Custom Reminder'),
    ]
    
    project = models.ForeignKey(SurveyProject, on_delete=models.CASCADE, related_name='reminders')
    deadline = models.ForeignKey(ProjectDeadline, on_delete=models.CASCADE, null=True, blank=True, related_name='reminders')
    reminder_type = models.CharField(max_length=50, choices=REMINDER_TYPE_CHOICES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    
    # Recipients
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_reminders')
    send_email = models.BooleanField(default=True)
    send_sms = models.BooleanField(default=False)
    send_in_app = models.BooleanField(default=True)
    
    # Scheduling
    scheduled_for = models.DateTimeField()
    sent_at = models.DateTimeField(null=True, blank=True)
    is_sent = models.BooleanField(default=False)
    
    # Tracking
    email_sent = models.BooleanField(default=False)
    sms_sent = models.BooleanField(default=False)
    in_app_sent = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'project_reminders'
        ordering = ['scheduled_for']
        verbose_name = 'Project Reminder'
        verbose_name_plural = 'Project Reminders'
    
    def __str__(self):
        return f"{self.project.project_name} - {self.title}"


class ProjectUpdate(models.Model):
    """
    Project Update model for tracking project progress
    """
    project = models.ForeignKey(SurveyProject, on_delete=models.CASCADE, related_name='updates')
    status = models.CharField(max_length=50, choices=SurveyProject.STATUS_CHOICES)
    notes = models.TextField()
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Link to specific deadline if this update relates to one
    related_deadline = models.ForeignKey(ProjectDeadline, on_delete=models.SET_NULL, null=True, blank=True)
    
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

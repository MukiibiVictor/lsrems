from django.db import models
from django.conf import settings


class Notification(models.Model):
    TYPE_CHOICES = [
        ('project_assigned',    'Project Assigned'),
        ('project_claimed',     'Project Claimed'),
        ('project_status',      'Project Status Changed'),
        ('project_completed',   'Project Completed'),
        ('project_overdue',     'Project Overdue'),
        ('new_project',         'New Project Created'),
        ('new_property',        'New Property Added'),
        ('new_customer',        'New Customer Added'),
        ('new_expense',         'New Expense Recorded'),
        ('new_transaction',     'New Transaction'),
        ('general',             'General'),
    ]

    recipient    = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    sender       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='sent_notifications')
    notif_type   = models.CharField(max_length=50, choices=TYPE_CHOICES, default='general')
    title        = models.CharField(max_length=255)
    message      = models.TextField()
    is_read      = models.BooleanField(default=False)
    # Optional link back to the related object
    project_id   = models.IntegerField(null=True, blank=True)
    property_id  = models.IntegerField(null=True, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.recipient.username} — {self.title}"


def notify_user(recipient, title, message, notif_type='general', sender=None, project_id=None, property_id=None):
    """Helper to create a notification for a single user."""
    if recipient is None:
        return
    Notification.objects.create(
        recipient=recipient, sender=sender,
        notif_type=notif_type, title=title, message=message,
        project_id=project_id, property_id=property_id,
    )


def notify_all_staff(title, message, notif_type='general', sender=None, exclude_user=None, project_id=None, property_id=None):
    """Broadcast a notification to all non-customer users."""
    from django.contrib.auth import get_user_model
    User = get_user_model()
    staff = User.objects.exclude(role='customer').exclude(is_active=False)
    if exclude_user:
        staff = staff.exclude(id=exclude_user.id)
    for user in staff:
        Notification.objects.create(
            recipient=user, sender=sender,
            notif_type=notif_type, title=title, message=message,
            project_id=project_id, property_id=property_id,
        )

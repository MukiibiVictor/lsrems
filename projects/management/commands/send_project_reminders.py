from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from datetime import timedelta
from projects.models import SurveyProject, ProjectDeadline, ProjectReminder

User = get_user_model()


class Command(BaseCommand):
    help = 'Send automated reminders for project deadlines and scheduled tasks'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what reminders would be sent without actually sending them',
        )
        parser.add_argument(
            '--days-ahead',
            type=int,
            default=7,
            help='Look ahead this many days for upcoming deadlines (default: 7)',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        days_ahead = options['days_ahead']
        
        self.stdout.write(
            self.style.SUCCESS(f'Checking for project reminders (looking {days_ahead} days ahead)...')
        )
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No reminders will be sent'))
        
        # Get current time and future cutoff
        now = timezone.now()
        future_cutoff = now + timedelta(days=days_ahead)
        
        reminders_sent = 0
        
        # 1. Check for projects that need start reminders
        reminders_sent += self.check_project_start_reminders(now, future_cutoff, dry_run)
        
        # 2. Check for survey completion reminders
        reminders_sent += self.check_survey_completion_reminders(now, future_cutoff, dry_run)
        
        # 3. Check for land office submission deadlines
        reminders_sent += self.check_land_office_reminders(now, future_cutoff, dry_run)
        
        # 4. Check for overdue projects
        reminders_sent += self.check_overdue_projects(now, dry_run)
        
        # 5. Check custom deadlines
        reminders_sent += self.check_custom_deadlines(now, future_cutoff, dry_run)
        
        self.stdout.write(
            self.style.SUCCESS(f'Completed! {reminders_sent} reminders processed.')
        )

    def check_project_start_reminders(self, now, future_cutoff, dry_run):
        """Check for projects scheduled to start soon"""
        count = 0
        
        projects = SurveyProject.objects.filter(
            status='pending',
            scheduled_start_date__isnull=False,
            scheduled_start_date__gte=now.date(),
            scheduled_start_date__lte=future_cutoff.date(),
            enable_reminders=True
        )
        
        for project in projects:
            days_until_start = (project.scheduled_start_date - now.date()).days
            
            if days_until_start <= project.reminder_days_before:
                # Check if reminder already sent recently
                recent_reminder = ProjectReminder.objects.filter(
                    project=project,
                    reminder_type='deadline_approaching',
                    created_at__gte=now - timedelta(days=1)
                ).exists()
                
                if not recent_reminder:
                    if not dry_run:
                        self.create_start_reminder(project, days_until_start)
                    
                    self.stdout.write(
                        f'{"[DRY RUN] " if dry_run else ""}Start reminder for: {project.project_name} '
                        f'(starts in {days_until_start} days)'
                    )
                    count += 1
        
        return count

    def check_survey_completion_reminders(self, now, future_cutoff, dry_run):
        """Check for survey work completion deadlines"""
        count = 0
        
        projects = SurveyProject.objects.filter(
            status='survey_in_progress',
            scheduled_end_date__isnull=False,
            scheduled_end_date__gte=now.date(),
            scheduled_end_date__lte=future_cutoff.date(),
            enable_reminders=True
        )
        
        for project in projects:
            days_until_end = (project.scheduled_end_date - now.date()).days
            
            if days_until_end <= project.reminder_days_before:
                recent_reminder = ProjectReminder.objects.filter(
                    project=project,
                    reminder_type='deadline_approaching',
                    created_at__gte=now - timedelta(days=1)
                ).exists()
                
                if not recent_reminder:
                    if not dry_run:
                        self.create_completion_reminder(project, days_until_end)
                    
                    self.stdout.write(
                        f'{"[DRY RUN] " if dry_run else ""}Completion reminder for: {project.project_name} '
                        f'(due in {days_until_end} days)'
                    )
                    count += 1
        
        return count

    def check_land_office_reminders(self, now, future_cutoff, dry_run):
        """Check for land office processing deadlines"""
        count = 0
        
        projects = SurveyProject.objects.filter(
            status='submitted_to_land_office',
            expected_completion_date__isnull=False,
            expected_completion_date__gte=now.date(),
            expected_completion_date__lte=future_cutoff.date(),
            enable_reminders=True
        )
        
        for project in projects:
            days_until_completion = (project.expected_completion_date - now.date()).days
            
            if days_until_completion <= project.reminder_days_before:
                recent_reminder = ProjectReminder.objects.filter(
                    project=project,
                    reminder_type='deadline_approaching',
                    created_at__gte=now - timedelta(days=1)
                ).exists()
                
                if not recent_reminder:
                    if not dry_run:
                        self.create_land_office_reminder(project, days_until_completion)
                    
                    self.stdout.write(
                        f'{"[DRY RUN] " if dry_run else ""}Land office reminder for: {project.project_name} '
                        f'(expected in {days_until_completion} days)'
                    )
                    count += 1
        
        return count

    def check_overdue_projects(self, now, dry_run):
        """Check for overdue projects"""
        count = 0
        
        # Projects that should have started but haven't
        overdue_start = SurveyProject.objects.filter(
            status='pending',
            scheduled_start_date__isnull=False,
            scheduled_start_date__lt=now.date(),
            enable_reminders=True
        )
        
        # Projects with overdue survey work
        overdue_survey = SurveyProject.objects.filter(
            status='survey_in_progress',
            scheduled_end_date__isnull=False,
            scheduled_end_date__lt=now.date(),
            enable_reminders=True
        )
        
        # Projects overdue from land office
        overdue_land_office = SurveyProject.objects.filter(
            status='submitted_to_land_office',
            expected_completion_date__isnull=False,
            expected_completion_date__lt=now.date(),
            enable_reminders=True
        )
        
        for project in overdue_start:
            days_overdue = (now.date() - project.scheduled_start_date).days
            if not dry_run:
                self.create_overdue_reminder(project, f"Project start is {days_overdue} days overdue")
            
            self.stdout.write(
                f'{"[DRY RUN] " if dry_run else ""}Overdue start: {project.project_name} '
                f'({days_overdue} days overdue)'
            )
            count += 1
        
        for project in overdue_survey:
            days_overdue = (now.date() - project.scheduled_end_date).days
            if not dry_run:
                self.create_overdue_reminder(project, f"Survey completion is {days_overdue} days overdue")
            
            self.stdout.write(
                f'{"[DRY RUN] " if dry_run else ""}Overdue survey: {project.project_name} '
                f'({days_overdue} days overdue)'
            )
            count += 1
        
        for project in overdue_land_office:
            days_overdue = (now.date() - project.expected_completion_date).days
            if not dry_run:
                self.create_overdue_reminder(project, f"Land office processing is {days_overdue} days overdue")
            
            self.stdout.write(
                f'{"[DRY RUN] " if dry_run else ""}Overdue land office: {project.project_name} '
                f'({days_overdue} days overdue)'
            )
            count += 1
        
        return count

    def check_custom_deadlines(self, now, future_cutoff, dry_run):
        """Check custom project deadlines"""
        count = 0
        
        deadlines = ProjectDeadline.objects.filter(
            status__in=['pending', 'in_progress'],
            due_date__gte=now,
            due_date__lte=future_cutoff,
            reminder_sent=False
        )
        
        for deadline in deadlines:
            days_until_due = (deadline.due_date.date() - now.date()).days
            
            if days_until_due <= deadline.reminder_days_before:
                if not dry_run:
                    self.create_deadline_reminder(deadline, days_until_due)
                    deadline.reminder_sent = True
                    deadline.save()
                
                self.stdout.write(
                    f'{"[DRY RUN] " if dry_run else ""}Custom deadline: {deadline.title} '
                    f'(due in {days_until_due} days)'
                )
                count += 1
        
        return count

    def create_start_reminder(self, project, days_until_start):
        """Create a project start reminder"""
        message = f"""
Project Start Reminder

Project: {project.project_name}
Location: {project.location}
Customer: {project.customer.name}
Scheduled Start: {project.scheduled_start_date}
Days Until Start: {days_until_start}

Please ensure you are prepared to begin survey work on the scheduled date.
Contact the customer if you need to reschedule.
        """.strip()
        
        ProjectReminder.objects.create(
            project=project,
            reminder_type='deadline_approaching',
            title=f'Project Starting Soon: {project.project_name}',
            message=message,
            recipient=project.surveyor or project.customer.projects.first().surveyor,
            scheduled_for=timezone.now(),
            send_email=True,
            send_in_app=True
        )

    def create_completion_reminder(self, project, days_until_end):
        """Create a survey completion reminder"""
        message = f"""
Survey Completion Reminder

Project: {project.project_name}
Location: {project.location}
Customer: {project.customer.name}
Scheduled Completion: {project.scheduled_end_date}
Days Until Deadline: {days_until_end}

Please ensure survey work is completed on time and documents are prepared for submission.
        """.strip()
        
        ProjectReminder.objects.create(
            project=project,
            reminder_type='deadline_approaching',
            title=f'Survey Completion Due: {project.project_name}',
            message=message,
            recipient=project.surveyor,
            scheduled_for=timezone.now(),
            send_email=True,
            send_in_app=True
        )

    def create_land_office_reminder(self, project, days_until_completion):
        """Create a land office processing reminder"""
        message = f"""
Land Office Processing Reminder

Project: {project.project_name}
Location: {project.location}
Customer: {project.customer.name}
Expected Completion: {project.expected_completion_date}
Days Until Expected Completion: {days_until_completion}

Please follow up with the land office if documents are taking longer than expected.
        """.strip()
        
        # Send to both surveyor and admin
        recipients = [project.surveyor]
        admins = User.objects.filter(role='admin')
        recipients.extend(admins)
        
        for recipient in recipients:
            if recipient:
                ProjectReminder.objects.create(
                    project=project,
                    reminder_type='deadline_approaching',
                    title=f'Land Office Processing: {project.project_name}',
                    message=message,
                    recipient=recipient,
                    scheduled_for=timezone.now(),
                    send_email=True,
                    send_in_app=True
                )

    def create_overdue_reminder(self, project, overdue_message):
        """Create an overdue project reminder"""
        message = f"""
OVERDUE PROJECT ALERT

Project: {project.project_name}
Location: {project.location}
Customer: {project.customer.name}
Status: {project.get_status_display()}

{overdue_message}

Immediate action required. Please update the project status or contact the customer.
        """.strip()
        
        # Send to surveyor and admin
        recipients = [project.surveyor]
        admins = User.objects.filter(role='admin')
        recipients.extend(admins)
        
        for recipient in recipients:
            if recipient:
                ProjectReminder.objects.create(
                    project=project,
                    reminder_type='overdue',
                    title=f'OVERDUE: {project.project_name}',
                    message=message,
                    recipient=recipient,
                    scheduled_for=timezone.now(),
                    send_email=True,
                    send_in_app=True,
                    send_sms=True  # SMS for urgent overdue items
                )

    def create_deadline_reminder(self, deadline, days_until_due):
        """Create a custom deadline reminder"""
        message = f"""
Deadline Reminder

Project: {deadline.project.project_name}
Deadline: {deadline.title}
Due Date: {deadline.due_date}
Days Until Due: {days_until_due}

Description: {deadline.description}

Please ensure this milestone is completed on time.
        """.strip()
        
        recipient = deadline.assigned_to or deadline.project.surveyor
        
        if recipient:
            ProjectReminder.objects.create(
                project=deadline.project,
                deadline=deadline,
                reminder_type='deadline_approaching',
                title=f'Deadline Approaching: {deadline.title}',
                message=message,
                recipient=recipient,
                scheduled_for=timezone.now(),
                send_email=True,
                send_in_app=True
            )
from django.db import models
from django.conf import settings


class Expense(models.Model):
    CATEGORY_CHOICES = [
        ('equipment', 'Equipment'),
        ('transport', 'Transport'),
        ('office', 'Office Supplies'),
        ('salaries', 'Salaries'),
        ('utilities', 'Utilities'),
        ('marketing', 'Marketing'),
        ('maintenance', 'Maintenance'),
        ('other', 'Other'),
    ]

    title = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    description = models.TextField(blank=True)
    expense_date = models.DateField()
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='expenses',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'expenses'
        ordering = ['-expense_date']
        verbose_name = 'Expense'
        verbose_name_plural = 'Expenses'

    def __str__(self):
        return f"{self.title} — {self.amount} ({self.expense_date})"

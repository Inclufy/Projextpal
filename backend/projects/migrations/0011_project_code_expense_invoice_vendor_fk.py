"""Add project_code on Project; vendor + invoice FKs on Expense and BudgetItem;
lowercase Expense.STATUS_CHOICES."""
import django.db.models.deletion
from django.db import migrations, models


def normalize_expense_status(apps, schema_editor):
    Expense = apps.get_model('projects', 'Expense')
    mapping = {'Pending': 'pending', 'Approved': 'approved', 'Paid': 'paid'}
    for old, new in mapping.items():
        Expense.objects.filter(status=old).update(status=new)


def denormalize_expense_status(apps, schema_editor):
    Expense = apps.get_model('projects', 'Expense')
    mapping = {'pending': 'Pending', 'approved': 'Approved', 'paid': 'Paid'}
    for old, new in mapping.items():
        Expense.objects.filter(status=old).update(status=new)


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0010_project_currency'),
        ('finance', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='project_code',
            field=models.CharField(
                blank=True, db_index=True, max_length=64,
                help_text="Code used by finance/admin systems for invoice matching (e.g. 'P-2026-001').",
            ),
        ),
        # Expense status: data normalize then field choices update
        migrations.RunPython(normalize_expense_status, denormalize_expense_status),
        migrations.AlterField(
            model_name='expense',
            name='status',
            field=models.CharField(
                choices=[
                    ('pending', 'Pending'),
                    ('approved', 'Approved'),
                    ('paid', 'Paid'),
                ],
                default='pending',
                max_length=20,
            ),
        ),
        # Expense FKs to finance app
        migrations.AddField(
            model_name='expense',
            name='vendor',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='expenses', to='finance.vendor',
            ),
        ),
        migrations.AddField(
            model_name='expense',
            name='invoice',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='expenses', to='finance.invoice',
            ),
        ),
        # BudgetItem FKs to finance app
        migrations.AddField(
            model_name='budgetitem',
            name='vendor',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='budget_items', to='finance.vendor',
            ),
        ),
        migrations.AddField(
            model_name='budgetitem',
            name='invoice',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='budget_items', to='finance.invoice',
            ),
        ),
    ]

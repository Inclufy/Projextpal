"""Initial migration for the finance app — Vendor, Invoice, InvoiceLineItem, InvoicePayment."""
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('accounts', '0002_crmapikey'),
        ('projects', '0010_project_currency'),
        ('programs', '0004_programteam'),
    ]

    operations = [
        migrations.CreateModel(
            name='Vendor',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('legal_name', models.CharField(blank=True, max_length=255)),
                ('vendor_code', models.CharField(blank=True, max_length=64)),
                ('vat_id', models.CharField(blank=True, max_length=64)),
                ('chamber_of_commerce', models.CharField(blank=True, max_length=64)),
                ('contact_name', models.CharField(blank=True, max_length=255)),
                ('contact_email', models.EmailField(blank=True, max_length=254)),
                ('contact_phone', models.CharField(blank=True, max_length=64)),
                ('website', models.URLField(blank=True)),
                ('address_line_1', models.CharField(blank=True, max_length=255)),
                ('address_line_2', models.CharField(blank=True, max_length=255)),
                ('postal_code', models.CharField(blank=True, max_length=32)),
                ('city', models.CharField(blank=True, max_length=128)),
                ('country', models.CharField(blank=True, max_length=2)),
                ('default_category', models.CharField(blank=True, max_length=50)),
                ('default_currency', models.CharField(
                    choices=[
                        ('EUR', 'Euro'), ('USD', 'US Dollar'), ('GBP', 'British Pound'),
                        ('AED', 'UAE Dirham'), ('SAR', 'Saudi Riyal'), ('MAD', 'Moroccan Dirham'),
                    ],
                    default='EUR', max_length=3,
                )),
                ('payment_terms_days', models.PositiveIntegerField(default=30)),
                ('is_active', models.BooleanField(default=True)),
                ('notes', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('company', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='vendors', to='accounts.company',
                )),
                ('created_by', models.ForeignKey(
                    blank=True, null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='created_vendors', to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'ordering': ['name'],
                'unique_together': {('company', 'vendor_code')},
            },
        ),
        migrations.AddIndex(
            model_name='vendor',
            index=models.Index(fields=['company', 'name'], name='finance_ven_company_name_idx'),
        ),
        migrations.AddIndex(
            model_name='vendor',
            index=models.Index(fields=['company', 'vendor_code'], name='finance_ven_company_code_idx'),
        ),
        migrations.AddIndex(
            model_name='vendor',
            index=models.Index(fields=['company', 'vat_id'], name='finance_ven_company_vat_idx'),
        ),
        migrations.CreateModel(
            name='Invoice',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('invoice_number', models.CharField(max_length=64)),
                ('project_code', models.CharField(blank=True, max_length=64)),
                ('program_code', models.CharField(blank=True, max_length=64)),
                ('purchase_order', models.CharField(blank=True, max_length=64)),
                ('external_id', models.CharField(blank=True, max_length=128)),
                ('issue_date', models.DateField()),
                ('due_date', models.DateField(blank=True, null=True)),
                ('paid_at', models.DateField(blank=True, null=True)),
                ('currency', models.CharField(
                    choices=[
                        ('EUR', 'Euro'), ('USD', 'US Dollar'), ('GBP', 'British Pound'),
                        ('AED', 'UAE Dirham'), ('SAR', 'Saudi Riyal'), ('MAD', 'Moroccan Dirham'),
                    ],
                    default='EUR', max_length=3,
                )),
                ('amount_excl_vat', models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                ('vat_rate', models.DecimalField(decimal_places=2, default=21, max_digits=5)),
                ('vat_amount', models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                ('total_amount', models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                ('paid_amount', models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                ('status', models.CharField(
                    choices=[
                        ('draft', 'Draft'), ('received', 'Received'), ('approved', 'Approved'),
                        ('paid', 'Paid'), ('disputed', 'Disputed'), ('cancelled', 'Cancelled'),
                    ],
                    default='received', max_length=16,
                )),
                ('source', models.CharField(
                    choices=[
                        ('manual', 'Manual entry'), ('import_csv', 'CSV import'),
                        ('import_api', 'Financial admin API'), ('email_parse', 'Email parser'),
                    ],
                    default='manual', max_length=16,
                )),
                ('file_url', models.URLField(blank=True)),
                ('notes', models.TextField(blank=True)),
                ('approved_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('company', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='invoices', to='accounts.company',
                )),
                ('vendor', models.ForeignKey(
                    on_delete=django.db.models.deletion.PROTECT,
                    related_name='invoices', to='finance.vendor',
                )),
                ('project', models.ForeignKey(
                    blank=True, null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='vendor_invoices', to='projects.project',
                )),
                ('program', models.ForeignKey(
                    blank=True, null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='vendor_invoices', to='programs.program',
                )),
                ('submitted_by', models.ForeignKey(
                    blank=True, null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='submitted_invoices', to=settings.AUTH_USER_MODEL,
                )),
                ('approved_by', models.ForeignKey(
                    blank=True, null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='approved_invoices', to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'ordering': ['-issue_date', '-created_at'],
                'unique_together': {('vendor', 'invoice_number')},
            },
        ),
        migrations.AddIndex(
            model_name='invoice',
            index=models.Index(fields=['company', 'status'], name='finance_inv_company_status_idx'),
        ),
        migrations.AddIndex(
            model_name='invoice',
            index=models.Index(fields=['project'], name='finance_inv_project_idx'),
        ),
        migrations.AddIndex(
            model_name='invoice',
            index=models.Index(fields=['program'], name='finance_inv_program_idx'),
        ),
        migrations.AddIndex(
            model_name='invoice',
            index=models.Index(fields=['project_code'], name='finance_inv_project_code_idx'),
        ),
        migrations.AddIndex(
            model_name='invoice',
            index=models.Index(fields=['program_code'], name='finance_inv_program_code_idx'),
        ),
        migrations.AddIndex(
            model_name='invoice',
            index=models.Index(fields=['external_id'], name='finance_inv_external_id_idx'),
        ),
        migrations.AddIndex(
            model_name='invoice',
            index=models.Index(fields=['issue_date'], name='finance_inv_issue_date_idx'),
        ),
        migrations.CreateModel(
            name='InvoiceLineItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('description', models.CharField(max_length=512)),
                ('category', models.CharField(
                    choices=[
                        ('labor', 'Labor / Staff'), ('subcontractor', 'Subcontractor'),
                        ('consulting', 'Consulting'), ('material', 'Material'),
                        ('hardware', 'Hardware'), ('software', 'Software'),
                        ('software_license', 'Software License'), ('cloud_services', 'Cloud Services'),
                        ('travel', 'Travel'), ('training', 'Training'),
                        ('marketing', 'Marketing'), ('legal', 'Legal'),
                        ('office', 'Office / Facilities'), ('other', 'Other'),
                    ],
                    default='other', max_length=32,
                )),
                ('quantity', models.DecimalField(decimal_places=2, default=1, max_digits=10)),
                ('unit_price', models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                ('line_total', models.DecimalField(decimal_places=2, default=0, max_digits=14)),
                ('vat_rate', models.DecimalField(decimal_places=2, default=21, max_digits=5)),
                ('cost_center', models.CharField(blank=True, max_length=64)),
                ('period_start', models.DateField(blank=True, null=True)),
                ('period_end', models.DateField(blank=True, null=True)),
                ('notes', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('invoice', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='line_items', to='finance.invoice',
                )),
            ],
            options={'ordering': ['id']},
        ),
        migrations.CreateModel(
            name='InvoicePayment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('paid_at', models.DateField()),
                ('amount', models.DecimalField(decimal_places=2, max_digits=14)),
                ('method', models.CharField(blank=True, max_length=64)),
                ('reference', models.CharField(blank=True, max_length=128)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('invoice', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='payments', to='finance.invoice',
                )),
                ('recorded_by', models.ForeignKey(
                    blank=True, null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='recorded_invoice_payments', to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={'ordering': ['-paid_at']},
        ),
    ]

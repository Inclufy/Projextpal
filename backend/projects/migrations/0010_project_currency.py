from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0009_project_portfolio_project_program'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='currency',
            field=models.CharField(
                choices=[
                    ('EUR', 'Euro'),
                    ('USD', 'US Dollar'),
                    ('GBP', 'British Pound'),
                    ('AED', 'UAE Dirham'),
                    ('SAR', 'Saudi Riyal'),
                    ('MAD', 'Moroccan Dirham'),
                ],
                default='EUR',
                max_length=3,
            ),
        ),
    ]

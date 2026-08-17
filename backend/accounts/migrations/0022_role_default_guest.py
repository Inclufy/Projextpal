# Least-privilege: default rol van nieuwe gebruikers van "superadmin" naar
# "guest". Django-defaults werken op applicatieniveau; deze migratie wijzigt
# alleen de modelstate, geen bestaande rijen (audit daarvan gebeurt apart).
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0021_alter_company_eval_mode"),
    ]

    operations = [
        migrations.AlterField(
            model_name="customuser",
            name="role",
            field=models.CharField(
                choices=[
                    ("superadmin", "Super Admin"),
                    ("admin", "Administrator"),
                    ("pm", "Project Manager"),
                    ("program_manager", "Program Manager"),
                    ("contibuter", "Contibuter"),
                    ("reviewer", "Reviewer"),
                    ("guest", "Guest"),
                ],
                default="guest",
                max_length=100,
            ),
        ),
    ]

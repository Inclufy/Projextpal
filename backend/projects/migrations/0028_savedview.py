import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("accounts", "0017_aikey_bigautofield_index_normalize"),
        ("projects", "0027_savedanalyticsdashboard_audience_description"),
    ]

    operations = [
        migrations.CreateModel(
            name="SavedView",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("surface", models.CharField(db_index=True, max_length=32)),
                ("project_id_ref", models.IntegerField(blank=True, null=True)),
                ("name", models.CharField(max_length=120)),
                ("config", models.JSONField(blank=True, default=dict)),
                ("audience", models.CharField(choices=[("private", "Private (only me)"), ("management", "Management"), ("tenant", "Whole organization")], default="private", max_length=16)),
                ("shared", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("company", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="saved_views", to="accounts.company")),
                ("created_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="+", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["name"], "unique_together": {("company", "surface", "name")}},
        ),
    ]

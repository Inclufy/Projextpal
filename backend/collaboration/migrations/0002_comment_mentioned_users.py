from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("collaboration", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="comment",
            name="mentioned_users",
            field=models.ManyToManyField(blank=True, related_name="mentioned_in_comments", to=settings.AUTH_USER_MODEL),
        ),
    ]

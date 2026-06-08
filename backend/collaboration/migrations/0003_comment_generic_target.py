from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("collaboration", "0002_comment_mentioned_users"),
    ]

    operations = [
        migrations.AddField(
            model_name="comment",
            name="target_type",
            field=models.CharField(blank=True, db_index=True, default="", max_length=24),
        ),
        migrations.AddField(
            model_name="comment",
            name="target_id",
            field=models.IntegerField(blank=True, db_index=True, null=True),
        ),
    ]

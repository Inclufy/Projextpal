from django.db import migrations, models


class Migration(migrations.Migration):
    """Yanmar Sprint 0 — HighlightReport: 4-axis RAG + highlights/lowlights."""

    dependencies = [
        ("prince2", "0005_checkpointreport"),
    ]

    operations = [
        migrations.AddField(
            model_name="highlightreport",
            name="rag_budget",
            field=models.CharField(
                choices=[("green", "Green"), ("amber", "Amber"), ("red", "Red")],
                default="green", max_length=10,
            ),
        ),
        migrations.AddField(
            model_name="highlightreport",
            name="rag_planning",
            field=models.CharField(
                choices=[("green", "Green"), ("amber", "Amber"), ("red", "Red")],
                default="green", max_length=10,
            ),
        ),
        migrations.AddField(
            model_name="highlightreport",
            name="rag_resources",
            field=models.CharField(
                choices=[("green", "Green"), ("amber", "Amber"), ("red", "Red")],
                default="green", max_length=10,
            ),
        ),
        migrations.AddField(
            model_name="highlightreport",
            name="highlights",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="highlightreport",
            name="lowlights",
            field=models.TextField(blank=True, null=True),
        ),
    ]

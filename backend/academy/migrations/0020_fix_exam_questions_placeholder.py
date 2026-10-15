"""Backfill Exam.questions placeholder dicts into empty lists.

Historically ``import_frontend_courses`` wrote ``{'frontend_count': N}`` as a
placeholder for the per-course exam questions and never backfilled them.
``submit_exam`` iterates ``exam.questions`` assuming a list and crashed with
500 on every real course (every certificate gate therefore unreachable).

This migration flips every placeholder-shaped row to ``[]`` so the exam-not-
configured path kicks in cleanly. The qcount is moved to ``meta_frontend``
for the future ``bulk_generate_exams`` run that will insert real questions.
"""
from django.db import migrations


def fix_placeholder(apps, schema_editor):
    Exam = apps.get_model("academy", "Exam")
    for exam in Exam.objects.all():
        q = exam.questions
        if isinstance(q, dict):
            # Any dict shape = placeholder; move the hint into meta_frontend.
            meta = {}
            if "frontend_count" in q:
                meta["count"] = q.get("frontend_count")
            meta.update(q)
            setattr(exam, "meta_frontend", meta) if hasattr(exam, "meta_frontend") else None
            exam.questions = []
            exam.save(update_fields=["questions"])
        elif q is None:
            exam.questions = []
            exam.save(update_fields=["questions"])


def noop_back(apps, schema_editor):
    # One-way: we never want to re-introduce the placeholder dict.
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("academy", "0019_learningpath_learningpathitem"),
    ]

    operations = [
        migrations.RunPython(fix_placeholder, noop_back),
    ]

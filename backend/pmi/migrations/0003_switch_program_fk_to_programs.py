# Generated for UAT P1-PMI fix.
#
# Repoints every PMI model's ``program`` FK from ``projects.Project`` onto
# ``programs.Program``. The UI route ``/programs/:id/<pmi-tab>`` passes a
# ``programs.Program.id`` (not a Project id), so the pre-fix implementation
# rejected every POST with 400/403 — the component/board/charter/benefit/
# stakeholder/roadmap-item FKs were pointing at the wrong table.
#
# Prod currently has 0 rows in all six PMI tables (verified), so an ``AlterField``
# can switch the FK target in-place with no data risk. For dev robustness,
# though, we also run a defensive ``RunPython`` first that clears any locally-
# seeded rows that would otherwise block the FK integrity check once Postgres
# re-points the target table.

from django.db import migrations, models
import django.db.models.deletion


def _clear_rows(apps, schema_editor):
    """Delete every PMI row before the FK target table switches.

    Running on prod is a no-op (all six tables are empty). On a dev SQLite DB
    seeded against the old ``projects.Project`` FK, this prevents the subsequent
    AlterField from leaving orphaned ids pointing at a mismatched table.
    """
    for model_name in (
        'PMIGateDecision',
        'PMIBenefit',
        'PMIRoadmapItem',
        'PMIStakeholder',
        'PMIProgramCharter',
        'PMIGovernanceBoard',
        'PMIComponent',
    ):
        model = apps.get_model('pmi', model_name)
        model.objects.all().delete()


def _noop(apps, schema_editor):
    """Reverse is intentionally a no-op — rolling back the migration restores
    the old FK target, but the data was already empty on the way in.
    """
    return None


class Migration(migrations.Migration):

    dependencies = [
        ('pmi', '0002_pmibenefit_pmigatedecision_pmiprogramcharter_and_more'),
        ('programs', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(_clear_rows, reverse_code=_noop),
        migrations.AlterField(
            model_name='pmicomponent',
            name='program',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='pmi_components',
                to='programs.program',
            ),
        ),
        migrations.AlterField(
            model_name='pmigovernanceboard',
            name='program',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='pmi_governance_boards',
                to='programs.program',
            ),
        ),
        migrations.AlterField(
            model_name='pmiprogramcharter',
            name='program',
            field=models.OneToOneField(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='pmi_charter',
                to='programs.program',
            ),
        ),
        migrations.AlterField(
            model_name='pmibenefit',
            name='program',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='pmi_benefits',
                to='programs.program',
            ),
        ),
        migrations.AlterField(
            model_name='pmistakeholder',
            name='program',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='pmi_stakeholders',
                to='programs.program',
            ),
        ),
        migrations.AlterField(
            model_name='pmiroadmapitem',
            name='program',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='pmi_roadmap_items',
                to='programs.program',
            ),
        ),
    ]

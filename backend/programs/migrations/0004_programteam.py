from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('programs', '0003_program_portfolio'),
    ]

    operations = [
        migrations.CreateModel(
            name='ProgramTeam',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role', models.CharField(blank=True, max_length=100)),
                ('added_at', models.DateTimeField(auto_now_add=True)),
                ('is_active', models.BooleanField(default=True)),
                ('added_by', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='added_program_team_members',
                    to=settings.AUTH_USER_MODEL,
                )),
                ('program', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='team_members',
                    to='programs.program',
                )),
                ('user', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='program_teams',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'ordering': ['-added_at'],
                'unique_together': {('program', 'user')},
            },
        ),
    ]

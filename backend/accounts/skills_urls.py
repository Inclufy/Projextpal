"""URL routing for the member-skills endpoints (S9-05).

Mounted at ``/api/v1/skills/`` from ``core/urls.py``. Lives next to the
views in ``accounts/skills_views.py`` so a future app-split can lift
them out together without churn in ``accounts/urls.py`` (which is on
the task's "do not break"-list).
"""
from django.urls import path

from . import skills_views

urlpatterns = [
    path("catalog/", skills_views.catalog_list_create, name="skills-catalog"),
    path("me/", skills_views.my_skills, name="skills-me"),
    path("me/<int:pk>/", skills_views.my_skill_detail, name="skills-me-detail"),
    path("users/<int:user_id>/", skills_views.user_skills, name="skills-user"),
    path("match/", skills_views.match_skills, name="skills-match"),
]

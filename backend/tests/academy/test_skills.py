"""
Academy Tests - Skills, Gamification & Progression
Tests each feature one by one.
"""
import pytest
from academy.models import (
    SkillCategory, Skill, UserSkill, SkillGoal,
    LessonSkillMapping, SkillActivity,
)
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def skill_cat_technical(db):
    return SkillCategory.objects.create(
        id="technical",
        name="Technical Skills",
        name_nl="Technische Vaardigheden",
        icon="code",
        color="blue",
        order=1,
    )


@pytest.fixture
def skill_cat_soft(db):
    return SkillCategory.objects.create(
        id="soft-skills",
        name="Soft Skills",
        name_nl="Zachte Vaardigheden",
        icon="heart",
        color="pink",
        order=2,
    )


@pytest.fixture
def skill_cat_tools(db):
    return SkillCategory.objects.create(
        id="tools",
        name="PM Tools",
        name_nl="PM Gereedschappen",
        icon="wrench",
        color="green",
        order=3,
    )


@pytest.fixture
def skill_planning(db, skill_cat_technical):
    return Skill.objects.create(
        id="project-planning",
        category=skill_cat_technical,
        name="Project Planning",
        name_nl="Projectplanning",
        description="Planning and scheduling skills",
        level_1_points=0,
        level_2_points=100,
        level_3_points=300,
        level_4_points=600,
        level_5_points=1000,
    )


@pytest.fixture
def skill_leadership(db, skill_cat_soft):
    return Skill.objects.create(
        id="leadership",
        category=skill_cat_soft,
        name="Leadership",
        name_nl="Leiderschap",
        description="Team leadership skills",
        level_1_points=0,
        level_2_points=150,
        level_3_points=400,
        level_4_points=700,
        level_5_points=1200,
    )


@pytest.fixture
def skill_gantt(db, skill_cat_tools):
    return Skill.objects.create(
        id="gantt-charts",
        category=skill_cat_tools,
        name="Gantt Charts",
        name_nl="Gantt Diagrammen",
        level_1_points=0,
        level_2_points=50,
        level_3_points=150,
        level_4_points=300,
        level_5_points=500,
    )


@pytest.fixture
def user_skill(db, user, skill_planning):
    return UserSkill.objects.create(
        user=user,
        skill=skill_planning,
        points=0,
        level=1,
    )


# ── 1. Skill Category Tests ─────────────────────────────────────────

@pytest.mark.django_db
class TestSkillCategory:
    """Test skill category management."""

    def test_create_category(self, skill_cat_technical):
        assert skill_cat_technical.pk == "technical"
        assert skill_cat_technical.name == "Technical Skills"

    def test_category_bilingual(self, skill_cat_technical):
        assert skill_cat_technical.name_nl == "Technische Vaardigheden"

    def test_category_ordering(self, skill_cat_technical, skill_cat_soft, skill_cat_tools):
        cats = list(SkillCategory.objects.all())
        assert [c.order for c in cats] == [1, 2, 3]

    def test_category_str(self, skill_cat_technical):
        assert str(skill_cat_technical) == "Technical Skills"

    def test_multiple_categories(self, skill_cat_technical, skill_cat_soft, skill_cat_tools):
        assert SkillCategory.objects.count() == 3


# ── 2. Skill Tests ──────────────────────────────────────────────────

@pytest.mark.django_db
class TestSkill:
    """Test skill definitions and level thresholds."""

    def test_create_skill(self, skill_planning):
        assert skill_planning.pk == "project-planning"
        assert skill_planning.name == "Project Planning"

    def test_skill_bilingual(self, skill_planning):
        assert skill_planning.name_nl == "Projectplanning"

    def test_skill_level_thresholds(self, skill_planning):
        assert skill_planning.level_1_points == 0
        assert skill_planning.level_2_points == 100
        assert skill_planning.level_3_points == 300
        assert skill_planning.level_4_points == 600
        assert skill_planning.level_5_points == 1000

    def test_skill_category_relationship(self, skill_planning, skill_cat_technical):
        assert skill_planning.category == skill_cat_technical
        assert skill_planning in skill_cat_technical.skills.all()

    def test_skill_str(self, skill_planning):
        s = str(skill_planning)
        assert "Technical Skills" in s
        assert "Project Planning" in s

    def test_multiple_skills_in_category(self, skill_planning, skill_cat_technical):
        Skill.objects.create(
            id="risk-mgmt", category=skill_cat_technical,
            name="Risk Management", name_nl="Risicobeheer",
        )
        assert skill_cat_technical.skills.count() == 2

    def test_custom_level_thresholds(self, skill_gantt):
        assert skill_gantt.level_5_points == 500  # lower than planning skill


# ── 3. User Skill Progression Tests ─────────────────────────────────

@pytest.mark.django_db
class TestUserSkill:
    """Test user skill tracking, level-up, and progression."""

    def test_create_user_skill(self, user_skill):
        assert user_skill.points == 0
        assert user_skill.level == 1

    def test_calculate_level_1(self, user_skill):
        user_skill.points = 50
        assert user_skill.calculate_level() == 1

    def test_calculate_level_2(self, user_skill):
        user_skill.points = 100
        assert user_skill.calculate_level() == 2

    def test_calculate_level_3(self, user_skill):
        user_skill.points = 300
        assert user_skill.calculate_level() == 3

    def test_calculate_level_4(self, user_skill):
        user_skill.points = 600
        assert user_skill.calculate_level() == 4

    def test_calculate_level_5(self, user_skill):
        user_skill.points = 1000
        assert user_skill.calculate_level() == 5

    def test_calculate_level_beyond_max(self, user_skill):
        user_skill.points = 5000
        assert user_skill.calculate_level() == 5

    def test_add_points(self, user_skill):
        leveled_up = user_skill.add_points(50)
        assert user_skill.points == 50
        assert leveled_up is False

    def test_add_points_level_up(self, user_skill):
        leveled_up = user_skill.add_points(100)
        assert user_skill.points == 100
        assert user_skill.level == 2
        assert leveled_up is True

    def test_add_points_multiple_level_ups(self, user_skill):
        leveled_up = user_skill.add_points(600)
        assert user_skill.level == 4
        assert leveled_up is True

    def test_progress_to_next_level_start(self, user_skill):
        user_skill.points = 0
        user_skill.level = 1
        progress = user_skill.get_progress_to_next_level()
        assert progress == 0

    def test_progress_to_next_level_midway(self, user_skill):
        user_skill.points = 50
        user_skill.level = 1
        progress = user_skill.get_progress_to_next_level()
        assert progress == 50  # 50/100 = 50%

    def test_progress_to_next_level_max(self, user_skill):
        user_skill.points = 1000
        user_skill.level = 5
        progress = user_skill.get_progress_to_next_level()
        assert progress == 100  # Max level

    def test_unique_user_skill(self, user, skill_planning):
        UserSkill.objects.create(user=user, skill=skill_planning, points=0, level=1)
        with pytest.raises(Exception):
            UserSkill.objects.create(user=user, skill=skill_planning, points=10, level=1)

    def test_user_skill_str(self, user_skill):
        s = str(user_skill)
        assert "Level" in s
        assert "Project Planning" in s


# ── 4. Skill Goal Tests ─────────────────────────────────────────────

@pytest.mark.django_db
class TestSkillGoal:
    """Test skill target/goal setting."""

    def test_create_goal(self, user, skill_planning):
        goal = SkillGoal.objects.create(
            user=user,
            skill=skill_planning,
            target_level=3,
            reason="Want to become certified PM",
        )
        assert goal.target_level == 3
        assert goal.achieved is False

    def test_goal_with_deadline(self, user, skill_planning):
        from datetime import date, timedelta
        deadline = date.today() + timedelta(days=90)
        goal = SkillGoal.objects.create(
            user=user, skill=skill_planning,
            target_level=4, deadline=deadline,
        )
        assert goal.deadline == deadline

    def test_goal_achieved(self, user, skill_planning):
        from django.utils import timezone
        goal = SkillGoal.objects.create(
            user=user, skill=skill_planning,
            target_level=2, achieved=True,
            achieved_at=timezone.now(),
        )
        assert goal.achieved is True
        assert goal.achieved_at is not None

    def test_multiple_goals(self, user, skill_planning, skill_leadership):
        SkillGoal.objects.create(user=user, skill=skill_planning, target_level=3)
        SkillGoal.objects.create(user=user, skill=skill_leadership, target_level=2)
        assert user.skill_goals.count() == 2


# ── 5. Lesson Skill Mapping Tests ───────────────────────────────────

@pytest.mark.django_db
class TestLessonSkillMapping:
    """Test lesson-to-skill mappings with bonuses."""

    def test_create_mapping(self, skill_planning):
        mapping = LessonSkillMapping.objects.create(
            lesson_id="lesson-001",
            skill=skill_planning,
            points_awarded=15,
        )
        assert mapping.points_awarded == 15

    def test_mapping_with_bonuses(self, skill_planning):
        mapping = LessonSkillMapping.objects.create(
            lesson_id="lesson-002",
            skill=skill_planning,
            points_awarded=10,
            quiz_bonus=5,
            simulation_bonus=10,
            practice_bonus=8,
        )
        assert mapping.quiz_bonus == 5
        assert mapping.simulation_bonus == 10
        assert mapping.practice_bonus == 8

    def test_unique_lesson_skill(self, skill_planning):
        LessonSkillMapping.objects.create(
            lesson_id="lesson-003", skill=skill_planning, points_awarded=10,
        )
        with pytest.raises(Exception):
            LessonSkillMapping.objects.create(
                lesson_id="lesson-003", skill=skill_planning, points_awarded=20,
            )

    def test_multiple_skills_per_lesson(self, skill_planning, skill_leadership):
        LessonSkillMapping.objects.create(
            lesson_id="lesson-004", skill=skill_planning, points_awarded=10,
        )
        LessonSkillMapping.objects.create(
            lesson_id="lesson-004", skill=skill_leadership, points_awarded=5,
        )
        assert LessonSkillMapping.objects.filter(lesson_id="lesson-004").count() == 2


# ── 6. Skill Activity Tests ─────────────────────────────────────────

@pytest.mark.django_db
class TestSkillActivity:
    """Test skill activity tracking."""

    def test_lesson_complete_activity(self, user, skill_planning):
        activity = SkillActivity.objects.create(
            user=user,
            skill=skill_planning,
            activity_type="lesson_complete",
            points=15,
            metadata={"lesson_id": "lesson-001", "lesson_title": "Introduction"},
        )
        assert activity.activity_type == "lesson_complete"
        assert activity.points == 15

    def test_quiz_pass_activity(self, user, skill_planning):
        activity = SkillActivity.objects.create(
            user=user, skill=skill_planning,
            activity_type="quiz_pass", points=5,
            metadata={"score": 90, "quiz_id": "q-001"},
        )
        assert activity.activity_type == "quiz_pass"

    def test_simulation_activity(self, user, skill_planning):
        activity = SkillActivity.objects.create(
            user=user, skill=skill_planning,
            activity_type="simulation_correct", points=10,
            metadata={"simulation_id": "sim-001"},
        )
        assert activity.activity_type == "simulation_correct"

    def test_practice_submit_activity(self, user, skill_leadership):
        activity = SkillActivity.objects.create(
            user=user, skill=skill_leadership,
            activity_type="practice_submit", points=8,
        )
        assert activity.activity_type == "practice_submit"

    def test_activity_ordering(self, user, skill_planning):
        SkillActivity.objects.create(
            user=user, skill=skill_planning,
            activity_type="lesson_complete", points=10,
        )
        SkillActivity.objects.create(
            user=user, skill=skill_planning,
            activity_type="quiz_pass", points=5,
        )
        activities = list(SkillActivity.objects.filter(user=user))
        assert activities[0].created_at >= activities[1].created_at

    def test_activity_metadata_json(self, user, skill_planning):
        meta = {"lesson_id": "l1", "course_title": "PM", "duration": 15}
        activity = SkillActivity.objects.create(
            user=user, skill=skill_planning,
            activity_type="lesson_complete", points=15,
            metadata=meta,
        )
        assert activity.metadata["course_title"] == "PM"


# ── 7. Skill API Endpoint Tests ─────────────────────────────────────

@pytest.mark.django_db
class TestSkillAPI:
    """Test skill-related API endpoints."""

    def test_list_skill_categories(self, authenticated_client, skill_cat_technical):
        response = authenticated_client.get("/api/v1/academy/skills/categories/")
        assert response.status_code == 200

    def test_list_skills(self, authenticated_client, skill_planning):
        response = authenticated_client.get("/api/v1/academy/skills/skills/")
        assert response.status_code == 200

    def test_list_user_skills(self, authenticated_client, user_skill):
        response = authenticated_client.get("/api/v1/academy/skills/user-skills/")
        assert response.status_code == 200

    def test_list_skill_goals(self, authenticated_client, user, skill_planning):
        SkillGoal.objects.create(user=user, skill=skill_planning, target_level=3)
        response = authenticated_client.get("/api/v1/academy/skills/goals/")
        assert response.status_code == 200

    def test_list_skill_activities(self, authenticated_client, user, skill_planning):
        SkillActivity.objects.create(
            user=user, skill=skill_planning,
            activity_type="lesson_complete", points=10,
        )
        response = authenticated_client.get("/api/v1/academy/skills/activities/")
        assert response.status_code == 200

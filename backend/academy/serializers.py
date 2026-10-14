from rest_framework import serializers
from .models import (
    Course, CourseModule, CourseLesson, LessonVisual,
    SkillCategory, Skill, UserSkill, SkillGoal, 
    LessonSkillMapping, SkillActivity
)


# ============================================================================
# COURSE SERIALIZERS
# ============================================================================

class CourseLessonSerializer(serializers.ModelSerializer):
    visual = serializers.SerializerMethodField()
    practice_assignments = serializers.SerializerMethodField()

    class Meta:
        model = CourseLesson
        fields = '__all__'

    def get_visual(self, obj):
        """Get approved visual for this lesson"""
        try:
            visual = obj.visual
            if visual and visual.status == 'approved':
                return {
                    'visual_id': visual.visual_id,
                    'preview_image_url': visual.preview_image_url,
                    'ai_intent': visual.ai_intent,
                    'ai_concepts': visual.ai_concepts,
                }
        except LessonVisual.DoesNotExist:
            pass
        return None

    def get_practice_assignments(self, obj):
        """Surface practice assignments attached to this lesson so the
        player (CourseLearningPlayer.tsx) can read
        `lesson.practice_assignments[0].id` and open the submit modal.
        Without this, the reverse FK was silently absent from the
        serialized output and the submit button never fired.
        """
        # Deferred import avoids a circular import at module load.
        from .models import PracticeAssignment
        return [
            {"id": pa.id, "title": pa.title, "points": pa.points}
            for pa in PracticeAssignment.objects.filter(lesson=obj)
        ]


class LessonVisualConfigSerializer(serializers.ModelSerializer):
    """Serializer for admin visual template configuration"""

    class Meta:
        model = CourseLesson
        fields = ['id', 'title', 'title_nl', 'visual_type', 'visual_data']


class CourseModuleSerializer(serializers.ModelSerializer):
    lessons = CourseLessonSerializer(many=True, read_only=True)
    
    class Meta:
        model = CourseModule
        fields = ['id', 'title', 'description', 'order', 'lessons', 'course']


class CourseSerializer(serializers.ModelSerializer):
    modules = CourseModuleSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    instructor_name = serializers.CharField(source='instructor.name', read_only=True, default='')

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'title_nl', 'slug', 'description', 'description_nl',
            'price', 'difficulty', 'duration_hours', 'language',
            'is_featured', 'is_bestseller', 'is_new', 'has_certificate',
            'status', 'category', 'category_name', 'instructor',
            'instructor_name', 'icon', 'color', 'gradient',
            'rating', 'student_count', 'modules'
        ]


# ============================================================================
# SKILLS SYSTEM SERIALIZERS
# ============================================================================

class SkillSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_name_nl = serializers.CharField(source='category.name_nl', read_only=True)
    
    class Meta:
        model = Skill
        fields = [
            'id', 'category', 'category_name', 'category_name_nl',
            'name', 'name_nl', 'description', 'description_nl',
            'level_1_points', 'level_2_points', 'level_3_points',
            'level_4_points', 'level_5_points'
        ]


class UserSkillSerializer(serializers.ModelSerializer):
    skill = SkillSerializer(read_only=True)
    progress_to_next_level = serializers.SerializerMethodField()
    points_to_next_level = serializers.SerializerMethodField()
    level_name = serializers.SerializerMethodField()
    
    class Meta:
        model = UserSkill
        fields = [
            'id', 'skill', 'points', 'level', 'last_updated',
            'progress_to_next_level', 'points_to_next_level', 'level_name'
        ]
    
    def get_progress_to_next_level(self, obj):
        return obj.get_progress_to_next_level()
    
    def get_points_to_next_level(self, obj):
        if obj.level == 5:
            return 0
        next_threshold = getattr(obj.skill, f'level_{obj.level + 1}_points')
        return next_threshold - obj.points
    
    def get_level_name(self, obj):
        level_names = {
            1: {'en': 'Beginner', 'nl': 'Beginner'},
            2: {'en': 'Intermediate', 'nl': 'Gevorderd'},
            3: {'en': 'Advanced', 'nl': 'Vergevorderd'},
            4: {'en': 'Expert', 'nl': 'Expert'},
            5: {'en': 'Master', 'nl': 'Meester'},
        }
        return level_names.get(obj.level, {'en': 'Unknown', 'nl': 'Onbekend'})


class SkillCategorySerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)
    user_progress = serializers.SerializerMethodField()
    
    class Meta:
        model = SkillCategory
        fields = ['id', 'name', 'name_nl', 'icon', 'color', 'order', 'skills', 'user_progress']
    
    def get_user_progress(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return []
        
        user_skills = UserSkill.objects.filter(
            user=request.user,
            skill__category=obj
        ).select_related('skill')
        
        return UserSkillSerializer(user_skills, many=True).data


class SkillGoalSerializer(serializers.ModelSerializer):
    skill = SkillSerializer(read_only=True)
    skill_id = serializers.CharField(write_only=True)
    current_level = serializers.SerializerMethodField()
    current_points = serializers.SerializerMethodField()
    points_needed = serializers.SerializerMethodField()
    estimated_lessons = serializers.SerializerMethodField()
    
    class Meta:
        model = SkillGoal
        fields = [
            'id', 'skill', 'skill_id', 'target_level', 'deadline', 'reason',
            'achieved', 'achieved_at', 'created_at',
            'current_level', 'current_points', 'points_needed', 'estimated_lessons'
        ]
        read_only_fields = ['achieved', 'achieved_at', 'created_at']
    
    def get_current_level(self, obj):
        user_skill = UserSkill.objects.filter(
            user=obj.user,
            skill=obj.skill
        ).first()
        return user_skill.level if user_skill else 1
    
    def get_current_points(self, obj):
        user_skill = UserSkill.objects.filter(
            user=obj.user,
            skill=obj.skill
        ).first()
        return user_skill.points if user_skill else 0
    
    def get_points_needed(self, obj):
        current_points = self.get_current_points(obj)
        target_threshold = getattr(obj.skill, f'level_{obj.target_level}_points')
        return max(0, target_threshold - current_points)
    
    def get_estimated_lessons(self, obj):
        points_needed = self.get_points_needed(obj)
        avg_points_per_lesson = 15  # Average points per lesson
        return int(points_needed / avg_points_per_lesson) if points_needed > 0 else 0


class SkillActivitySerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    skill_name_nl = serializers.CharField(source='skill.name_nl', read_only=True)
    
    class Meta:
        model = SkillActivity
        fields = [
            'id', 'skill', 'skill_name', 'skill_name_nl',
            'activity_type', 'points', 'metadata', 'created_at'
        ]
        read_only_fields = ['created_at']
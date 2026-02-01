from rest_framework import serializers
from .models import (
    ProgramCharter, ScopeCapability, CriticalInterdependency,
    KeyRisk, KeyDeliverable, Resource ,Dependency
)


class ScopeCapabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = ScopeCapability
        fields = "__all__"


class CriticalInterdependencySerializer(serializers.ModelSerializer):
    class Meta:
        model = CriticalInterdependency
        fields = "__all__"


class KeyRiskSerializer(serializers.ModelSerializer):
    class Meta:
        model = KeyRisk
        fields = "__all__"


class KeyDeliverableSerializer(serializers.ModelSerializer):
    class Meta:
        model = KeyDeliverable
        fields = "__all__"


class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = "__all__"


class ProgramCharterSerializer(serializers.ModelSerializer):
    scopes = ScopeCapabilitySerializer(many=True, read_only=True)
    interdependencies = CriticalInterdependencySerializer(many=True, read_only=True)
    risks = KeyRiskSerializer(many=True, read_only=True)
    deliverables = KeyDeliverableSerializer(many=True, read_only=True)
    resources = ResourceSerializer(many=True, read_only=True)
    
    # Add field to control versioning behavior
    create_new_version = serializers.BooleanField(write_only=True, default=True, required=False)

    class Meta:
        model = ProgramCharter
        fields = "__all__"
        read_only_fields = ("version", "created_at")

    def create(self, validated_data):
        """
        Override create method to handle create_new_version field properly
        """
        # Remove create_new_version from validated_data as it's not a model field
        create_new_version = validated_data.pop('create_new_version', True)
        
        # Create the charter instance normally
        charter = ProgramCharter.objects.create(**validated_data)
        
        return charter

    def update(self, instance, validated_data):
        """
        Override update method to handle versioning
        """
        # Remove create_new_version from validated_data
        create_new_version = validated_data.pop('create_new_version', True)
        
        if create_new_version:
            # Create new version with updated data
            for field, value in validated_data.items():
                if hasattr(instance, field):
                    setattr(instance, field, value)
            
            # Use the model's create_new_version method
            new_instance = instance.create_new_version(**validated_data)
            return new_instance
        else:
            # Standard update behavior (updates existing record)
            for field, value in validated_data.items():
                if hasattr(instance, field):
                    setattr(instance, field, value)
            instance.save()
            return instance
        

# dependency serlizser 
class DependencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Dependency
        fields = "__all__"

# # lesson learned serlizser


# from .models import Survey, Question, ArchivedLesson


# class QuestionSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Question
#         fields = ["id", "text", "required"]


# class SurveySerializer(serializers.ModelSerializer):
#     project_name = serializers.CharField(source="project.name", read_only=True)
#     questions = QuestionSerializer(many=True)
    
#     class Meta:
#         model = Survey
#         fields = "__all__"

#     def create(self, validated_data):
#         questions_data = validated_data.pop("questions", [])
#         survey = Survey.objects.create(**validated_data)
#         for q in questions_data:
#             Question.objects.create(survey=survey, **q)
#         return survey

#     def update(self, instance, validated_data):
#         questions_data = validated_data.pop("questions", [])
#         for attr, value in validated_data.items():
#             setattr(instance, attr, value)
#         instance.save()
#         # Replace questions
#         instance.questions.all().delete()
#         for q in questions_data:
#             Question.objects.create(survey=instance, **q)
#         return instance


# class ArchivedLessonSerializer(serializers.ModelSerializer):
#     insights_list = serializers.ReadOnlyField()

#     class Meta:
#         model = ArchivedLesson
#         fields = "__all__"

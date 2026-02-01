from rest_framework import serializers
from .models import PostProject

class PostProjectSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.name", read_only=True)

    class Meta:
        model = PostProject
        fields = [
            "id",
            "company_name",   
            "projectname",
            "lessons_learned",
            "achieved_results",
            "roi",
            "savings",
            "created_at",
            "updated_at",
        ]

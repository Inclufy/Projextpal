from rest_framework import serializers

from .models import ProductIssue, ProductIssueComment


class ProductIssueCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductIssueComment
        fields = ["id", "issue", "author", "body", "is_triage_step", "created_at"]
        read_only_fields = ["created_at"]


class ProductIssueSerializer(serializers.ModelSerializer):
    """Full read/write serializer used by users + agent."""

    comments = ProductIssueCommentSerializer(many=True, read_only=True)

    class Meta:
        model = ProductIssue
        fields = [
            "id",
            # who/where
            "reporter",
            "company",
            "project",
            "source",
            "capture_method",
            # what
            "title",
            "description",
            "category",
            "reproduction_steps",
            "expected_behavior",
            "actual_behavior",
            "error_trace",
            "environment",
            "attachments",
            # triage
            "classification",
            "severity",
            "priority",
            "agent_triage_result",
            "triaged_at",
            "triaged_by",
            "duplicate_of",
            # reproduction
            "reproduction_attempted_at",
            "reproduction_result",
            "reproduction_log",
            "reproduction_evidence",
            # lifecycle
            "status",
            "assigned_to",
            "linked_pr_url",
            "resolved_at",
            "resolution_summary",
            # meta
            "created_at",
            "updated_at",
            "comments",
        ]
        read_only_fields = ["created_at", "updated_at"]


class ProductIssueAutoCISerializer(serializers.ModelSerializer):
    """Slim serializer used by the CI auto-POST endpoint.

    The CI runner has no logged-in user but does have an API token. The
    minimum data we need from CI is: the test that failed, the error trace,
    and the build context (commit-SHA, run-URL, branch).
    """

    class Meta:
        model = ProductIssue
        fields = [
            "title",
            "description",
            "category",
            "error_trace",
            "environment",
            "company",
            "project",
        ]

    def create(self, validated_data):
        # CI-posted issues are always source=auto-test-ci, capture=auto_ci
        validated_data.setdefault("source", "auto-test-ci")
        validated_data.setdefault("capture_method", "auto_ci")
        return super().create(validated_data)


class ProductIssueTriageUpdateSerializer(serializers.ModelSerializer):
    """Used by the triage agent to update an issue with classification."""

    class Meta:
        model = ProductIssue
        fields = [
            "classification",
            "severity",
            "priority",
            "agent_triage_result",
            "triaged_at",
            "triaged_by",
            "duplicate_of",
            "reproduction_attempted_at",
            "reproduction_result",
            "reproduction_log",
            "status",
        ]

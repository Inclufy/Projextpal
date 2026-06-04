from rest_framework import serializers
from .models import MSPBenefit, BenefitRealization, MSPTranche


class BenefitRealizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = BenefitRealization
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class MSPBenefitSerializer(serializers.ModelSerializer):
    realizations = BenefitRealizationSerializer(many=True, read_only=True)
    total_realized = serializers.SerializerMethodField()

    class Meta:
        model = MSPBenefit
        fields = '__all__'
        # `program` is injected server-side from the nested URL in perform_create
        # (mirrors the lss_green/project pattern). Keeping it read-only lets the
        # nested create validate without the client re-supplying the program id.
        read_only_fields = ['id', 'program', 'created_at', 'updated_at']

    def get_total_realized(self, obj):
        from django.db.models import Sum
        total = obj.realizations.aggregate(total=Sum('actual_value'))['total']
        return float(total) if total else 0


class MSPTrancheSerializer(serializers.ModelSerializer):
    class Meta:
        model = MSPTranche
        fields = '__all__'
        # `program` injected server-side in perform_create (see MSPBenefitSerializer).
        read_only_fields = ['id', 'program', 'created_at', 'updated_at']

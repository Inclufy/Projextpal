from rest_framework import serializers
from .models import (
    MSPBenefit, BenefitRealization, MSPTranche, MSPBlueprint, MSPTransition,
)


class BenefitRealizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = BenefitRealization
        fields = '__all__'
        # `benefit` is injected server-side from the nested route
        # (/benefits/<id>/realizations/), so it is read-only on input.
        read_only_fields = ['id', 'benefit', 'created_at']


class MSPBenefitSerializer(serializers.ModelSerializer):
    realizations = BenefitRealizationSerializer(many=True, read_only=True)
    total_realized = serializers.SerializerMethodField()
    latest_actual = serializers.SerializerMethodField()
    variance = serializers.SerializerMethodField()
    variance_pct = serializers.SerializerMethodField()
    owner_name = serializers.SerializerMethodField()

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

    def get_latest_actual(self, obj):
        v = obj.latest_actual
        return float(v) if v is not None else None

    def get_variance(self, obj):
        v = obj.variance
        return float(v) if v is not None else None

    def get_variance_pct(self, obj):
        # Variance relative to the planned improvement (target - baseline).
        if obj.baseline_value is None or obj.target_value is None:
            return None
        planned_delta = obj.target_value - obj.baseline_value
        if planned_delta == 0:
            return None
        actual = obj.latest_actual
        if actual is None:
            return None
        return round(float((actual - obj.baseline_value) / planned_delta) * 100)

    def get_owner_name(self, obj):
        if obj.owner_id:
            return obj.owner.get_full_name() or obj.owner.email
        return None


class MSPTrancheSerializer(serializers.ModelSerializer):
    transition_count = serializers.SerializerMethodField()

    class Meta:
        model = MSPTranche
        fields = '__all__'
        # `program` injected server-side in perform_create (see MSPBenefitSerializer).
        read_only_fields = ['id', 'program', 'closed_at', 'created_at', 'updated_at']

    def get_transition_count(self, obj):
        return obj.transitions.count()


class MSPBlueprintSerializer(serializers.ModelSerializer):
    class Meta:
        model = MSPBlueprint
        fields = '__all__'
        read_only_fields = ['id', 'program', 'created_at', 'updated_at']


class MSPTransitionSerializer(serializers.ModelSerializer):
    bcm_name = serializers.SerializerMethodField()

    class Meta:
        model = MSPTransition
        fields = '__all__'
        read_only_fields = ['id', 'program', 'created_at', 'updated_at']

    def get_bcm_name(self, obj):
        if obj.bcm_id:
            return obj.bcm.get_full_name() or obj.bcm.email
        return None

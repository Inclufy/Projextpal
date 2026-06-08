import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useLanguage } from '../../contexts/LanguageContext';
import { CommentsThread } from '../../components/CommentsThread';
import { COLORS } from '../../constants/colors';
import { risksService } from '../../services/risks';
import type { Risk } from '../../types';

type RiskDetailRouteParams = {
  RiskDetail: { riskId: string };
};

export const RiskDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RiskDetailRouteParams, 'RiskDetail'>>();
  const { t, isNL } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [risk, setRisk] = useState<Risk | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadRisk = useCallback(async () => {
    const riskId = route.params?.riskId;
    if (!riskId) {
      setError(isNL ? 'Geen risico geselecteerd' : 'No risk selected');
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const data = await risksService.getRisk(riskId);
      setRisk(data);
    } catch (e) {
      console.error('Failed to load risk:', e);
      setError(isNL ? 'Kon risico niet laden' : 'Could not load risk');
      setRisk(null);
    } finally {
      setLoading(false);
    }
  }, [route.params?.riskId, isNL]);

  useEffect(() => {
    loadRisk();
  }, [loadRisk]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRisk();
    setRefreshing(false);
  }, [loadRisk]);

  const normalize = (v: string | undefined | null) => (v || '').toString().toLowerCase();

  const getRiskLevelColor = (level: string | undefined | null) => {
    const v = normalize(level);
    if (v === 'very high' || v === 'critical') return COLORS.red;
    if (v === 'high') return COLORS.orange;
    if (v === 'medium') return COLORS.yellow;
    if (v === 'low' || v === 'very low') return COLORS.green;
    return COLORS.gray[400];
  };

  const getRiskLevelLabel = (level: string | undefined | null) => {
    const v = normalize(level);
    switch (v) {
      case 'very high':
        return isNL ? 'Zeer hoog' : 'Very High';
      case 'high':
        return t.high;
      case 'medium':
        return t.medium;
      case 'low':
        return t.low;
      case 'very low':
        return isNL ? 'Zeer laag' : 'Very Low';
      case 'critical':
        return isNL ? 'Kritiek' : 'Critical';
      default:
        return level || '';
    }
  };

  // Derive overall risk level from score (1-25) when present, otherwise from impact.
  const deriveRiskLevel = (r: Risk): string => {
    const score = r.score ?? 0;
    if (score >= 20) return 'Very High';
    if (score >= 15) return 'High';
    if (score >= 8) return 'Medium';
    if (score > 0) return 'Low';
    // Fallback: highest of probability/impact
    return r.impact || r.probability || 'Low';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.purple} />
      </View>
    );
  }

  if (error || !risk) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[COLORS.gray[600], COLORS.gray[800]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{t.riskDetails}</Text>
          </View>
          <View style={styles.menuButton} />
        </LinearGradient>
        <View style={styles.emptyContainer}>
          <Ionicons name="shield-outline" size={64} color={COLORS.gray[300]} />
          <Text style={styles.emptyTitle}>
            {error || (isNL ? 'Geen risico gevonden' : 'No risk found')}
          </Text>
          <Text style={styles.emptySubtitle}>
            {isNL
              ? 'Probeer terug te gaan en een ander risico te selecteren.'
              : 'Try going back and selecting a different risk.'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadRisk}>
            <Text style={styles.retryButtonText}>
              {isNL ? 'Opnieuw proberen' : 'Try again'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const overallLevel = deriveRiskLevel(risk);
  const riskColor = getRiskLevelColor(overallLevel);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[riskColor, COLORS.gray[800]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{t.riskDetails}</Text>
          <View style={styles.riskLevelBadge}>
            <Ionicons name="warning" size={14} color={COLORS.white} />
            <Text style={styles.riskLevelText}>
              {getRiskLevelLabel(overallLevel)}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.purple]}
          />
        }
      >
        {/* Risk Info Card */}
        <View style={styles.riskCard}>
          <Text style={styles.riskTitle}>{risk.title}</Text>
          {risk.description ? (
            <Text style={styles.riskDescription}>{risk.description}</Text>
          ) : null}

          {/* Project & Category */}
          <View style={styles.metaRow}>
            {risk.project?.name ? (
              <View style={styles.metaItem}>
                <Ionicons name="folder-outline" size={16} color={COLORS.gray[500]} />
                <Text style={styles.metaText}>{risk.project.name}</Text>
              </View>
            ) : null}
            {risk.category ? (
              <View style={styles.metaItem}>
                <Ionicons name="pricetag-outline" size={16} color={COLORS.gray[500]} />
                <Text style={styles.metaText}>{risk.category}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Risk Assessment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isNL ? 'Risicobeoordeling' : 'Risk Assessment'}
          </Text>
          <View style={styles.assessmentCard}>
            <View style={styles.assessmentRow}>
              <View style={styles.assessmentItem}>
                <Text style={styles.assessmentLabel}>{t.probability}</Text>
                <View style={[styles.assessmentBadge, { backgroundColor: `${getRiskLevelColor(risk.probability)}15` }]}>
                  <Text style={[styles.assessmentValue, { color: getRiskLevelColor(risk.probability) }]}>
                    {getRiskLevelLabel(risk.probability)}
                  </Text>
                </View>
              </View>
              <View style={styles.assessmentItem}>
                <Text style={styles.assessmentLabel}>{t.impact}</Text>
                <View style={[styles.assessmentBadge, { backgroundColor: `${getRiskLevelColor(risk.impact)}15` }]}>
                  <Text style={[styles.assessmentValue, { color: getRiskLevelColor(risk.impact) }]}>
                    {getRiskLevelLabel(risk.impact)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Risk Matrix Visual */}
            <View style={styles.riskMatrixContainer}>
              <View style={[styles.riskIndicator, { backgroundColor: riskColor }]}>
                <Ionicons name="warning" size={24} color={COLORS.white} />
              </View>
              <Text style={[styles.riskLevelLarge, { color: riskColor }]}>
                {getRiskLevelLabel(overallLevel)} {isNL ? 'Risico' : 'Risk'}
              </Text>
            </View>
          </View>
        </View>

        {/* Owner & Date */}
        {(risk.owner?.name || risk.identifiedDate) ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{isNL ? 'Details' : 'Details'}</Text>
            <View style={styles.detailsCard}>
              {risk.owner?.name ? (
                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <Ionicons name="person-outline" size={18} color={COLORS.purple} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>
                      {isNL ? 'Eigenaar' : 'Owner'}
                    </Text>
                    <Text style={styles.detailValue}>{risk.owner.name}</Text>
                  </View>
                </View>
              ) : null}
              {risk.owner?.name && risk.identifiedDate ? (
                <View style={styles.detailDivider} />
              ) : null}
              {risk.identifiedDate ? (
                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <Ionicons name="calendar-outline" size={18} color={COLORS.purple} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>
                      {isNL ? 'Geïdentificeerd' : 'Identified'}
                    </Text>
                    <Text style={styles.detailValue}>
                      {new Date(risk.identifiedDate).toLocaleDateString(isNL ? 'nl-NL' : 'en-US')}
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* Mitigation Plan */}
        {risk.mitigation ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.mitigation}</Text>
            <View style={styles.mitigationCard}>
              <Text style={styles.mitigationText}>{risk.mitigation}</Text>
            </View>
          </View>
        ) : null}

        {risk && ((risk as any).project_id || (risk as any).project) ? (
          <CommentsThread
            target={{ projectId: (risk as any).project_id || (risk as any).project, targetType: 'risk', targetId: risk.id }}
            isNL={isNL}
          />
        ) : null}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    paddingHorizontal: 32,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray[700],
    textAlign: 'center',
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.gray[500],
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: COLORS.purple,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  riskLevelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskLevelText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: 4,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  riskCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  riskTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.gray[900],
    marginBottom: 8,
  },
  riskDescription: {
    fontSize: 14,
    color: COLORS.gray[600],
    lineHeight: 22,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginLeft: 6,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray[900],
    marginBottom: 16,
  },
  assessmentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  assessmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  assessmentItem: {
    alignItems: 'center',
  },
  assessmentLabel: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginBottom: 8,
  },
  assessmentBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  assessmentValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  riskMatrixContainer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  riskIndicator: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  riskLevelLarge: {
    fontSize: 18,
    fontWeight: '700',
  },
  detailsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${COLORS.purple}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray[800],
  },
  detailDivider: {
    height: 1,
    backgroundColor: COLORS.gray[100],
    marginLeft: 64,
  },
  mitigationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  mitigationText: {
    fontSize: 14,
    color: COLORS.gray[700],
    lineHeight: 22,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default RiskDetailScreen;

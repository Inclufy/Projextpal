import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useLanguage } from '../../contexts/LanguageContext';
import { COLORS } from '../../constants/colors';

type RiskDetailRouteParams = {
  RiskDetail: { riskId: string };
};

interface MitigationAction {
  id: string;
  description: string;
  owner: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
}

interface RiskData {
  id: string;
  title: string;
  description: string;
  project: string;
  category: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  owner: string;
  identifiedDate: string;
  status: 'open' | 'mitigating' | 'closed';
  mitigationPlan: string;
  actions: MitigationAction[];
}

export const RiskDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RiskDetailRouteParams, 'RiskDetail'>>();
  const { t, isNL } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [risk, setRisk] = useState<RiskData | null>(null);

  useEffect(() => {
    loadRiskData();
  }, []);

  const loadRiskData = async () => {
    // Simulated API call - replace with actual API
    setTimeout(() => {
      setRisk({
        id: route.params?.riskId || '1',
        title: isNL ? 'Budget Overschrijding' : 'Budget Overrun',
        description: isNL 
          ? 'Er is een risico dat het projectbudget wordt overschreden door onvoorziene kosten en scope creep.'
          : 'There is a risk that the project budget will be exceeded due to unforeseen costs and scope creep.',
        project: 'Digital Transformation',
        category: isNL ? 'Financieel' : 'Financial',
        probability: 'medium',
        impact: 'high',
        riskLevel: 'high',
        owner: 'Jan de Vries',
        identifiedDate: '2024-01-15',
        status: 'mitigating',
        mitigationPlan: isNL 
          ? 'Implementeer strikte budget monitoring en wekelijkse reviews. Zet een change control process op voor scope wijzigingen.'
          : 'Implement strict budget monitoring and weekly reviews. Set up a change control process for scope changes.',
        actions: [
          {
            id: '1',
            description: isNL ? 'Wekelijkse budget review meetings opzetten' : 'Set up weekly budget review meetings',
            owner: 'Jan de Vries',
            dueDate: '2024-01-20',
            status: 'completed',
          },
          {
            id: '2',
            description: isNL ? 'Change control process documenteren' : 'Document change control process',
            owner: 'Maria Bakker',
            dueDate: '2024-01-25',
            status: 'in_progress',
          },
          {
            id: '3',
            description: isNL ? 'Budget tracking dashboard implementeren' : 'Implement budget tracking dashboard',
            owner: 'Pieter Jansen',
            dueDate: '2024-02-01',
            status: 'pending',
          },
        ],
      });
      setLoading(false);
    }, 500);
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return COLORS.red;
      case 'high':
        return COLORS.orange;
      case 'medium':
        return COLORS.yellow;
      case 'low':
        return COLORS.green;
      default:
        return COLORS.gray[400];
    }
  };

  const getRiskLevelLabel = (level: string) => {
    switch (level) {
      case 'critical':
        return isNL ? 'Kritiek' : 'Critical';
      case 'high':
        return t.high;
      case 'medium':
        return t.medium;
      case 'low':
        return t.low;
      default:
        return level;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return COLORS.green;
      case 'in_progress':
        return COLORS.blue;
      case 'pending':
        return COLORS.orange;
      default:
        return COLORS.gray[400];
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return t.completed;
      case 'in_progress':
        return t.inProgress;
      case 'pending':
        return t.pending;
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.purple} />
      </View>
    );
  }

  if (!risk) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color={COLORS.red} />
        <Text style={styles.errorText}>{t.error}</Text>
      </View>
    );
  }

  const riskColor = getRiskLevelColor(risk.riskLevel);

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
              {getRiskLevelLabel(risk.riskLevel)}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Risk Info Card */}
        <View style={styles.riskCard}>
          <Text style={styles.riskTitle}>{risk.title}</Text>
          <Text style={styles.riskDescription}>{risk.description}</Text>

          {/* Project & Category */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="folder-outline" size={16} color={COLORS.gray[500]} />
              <Text style={styles.metaText}>{risk.project}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="pricetag-outline" size={16} color={COLORS.gray[500]} />
              <Text style={styles.metaText}>{risk.category}</Text>
            </View>
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
                {getRiskLevelLabel(risk.riskLevel)} {isNL ? 'Risico' : 'Risk'}
              </Text>
            </View>
          </View>
        </View>

        {/* Owner & Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isNL ? 'Details' : 'Details'}</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="person-outline" size={18} color={COLORS.purple} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>
                  {isNL ? 'Eigenaar' : 'Owner'}
                </Text>
                <Text style={styles.detailValue}>{risk.owner}</Text>
              </View>
            </View>
            <View style={styles.detailDivider} />
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
          </View>
        </View>

        {/* Mitigation Plan */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.mitigation}</Text>
          <View style={styles.mitigationCard}>
            <Text style={styles.mitigationText}>{risk.mitigationPlan}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isNL ? 'Acties' : 'Actions'}
          </Text>
          {risk.actions.map((action) => (
            <View key={action.id} style={styles.actionCard}>
              <View style={styles.actionHeader}>
                <View style={[
                  styles.actionStatus,
                  { backgroundColor: `${getStatusColor(action.status)}15` }
                ]}>
                  <Text style={[styles.actionStatusText, { color: getStatusColor(action.status) }]}>
                    {getStatusLabel(action.status)}
                  </Text>
                </View>
              </View>
              <Text style={styles.actionDescription}>{action.description}</Text>
              <View style={styles.actionMeta}>
                <View style={styles.actionMetaItem}>
                  <Ionicons name="person-outline" size={14} color={COLORS.gray[500]} />
                  <Text style={styles.actionMetaText}>{action.owner}</Text>
                </View>
                <View style={styles.actionMetaItem}>
                  <Ionicons name="calendar-outline" size={14} color={COLORS.gray[500]} />
                  <Text style={styles.actionMetaText}>
                    {new Date(action.dueDate).toLocaleDateString(isNL ? 'nl-NL' : 'en-US')}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray[600],
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
  actionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionHeader: {
    marginBottom: 8,
  },
  actionStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  actionStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionDescription: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray[800],
    marginBottom: 12,
  },
  actionMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  actionMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionMetaText: {
    fontSize: 13,
    color: COLORS.gray[500],
    marginLeft: 4,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default RiskDetailScreen;

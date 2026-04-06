import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../../components';
import { COLORS } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Risk, RiskProbability, RiskImpact } from '../../types';
import { riskService } from '../../services/risks';

const { width } = Dimensions.get('window');

export const RiskScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'matrix' | 'list'>('matrix');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'mitigated'>('all');

  const loadRisks = async () => {
    try {
      setLoading(true);
      const data = await riskService.getRisks();
      setRisks(data);
    } catch (error) {
      console.error('Error loading risks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRisks();
  }, []);

  const probabilityLevels: RiskProbability[] = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
  const impactLevels: RiskImpact[] = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];

  const getProbabilityValue = (prob: RiskProbability): number => {
    return probabilityLevels.indexOf(prob) + 1;
  };

  const getImpactValue = (impact: RiskImpact): number => {
    return impactLevels.indexOf(impact) + 1;
  };

  const getRiskScore = (prob: RiskProbability, impact: RiskImpact): number => {
    return getProbabilityValue(prob) * getImpactValue(impact);
  };

  const getRiskScoreColor = (score: number): string => {
    if (score <= 4) return COLORS.green;
    if (score <= 10) return COLORS.warning;
    if (score <= 15) return '#FF8C00'; // Orange
    return COLORS.error;
  };

  const getRiskScoreLabel = (score: number): string => {
    if (score <= 4) return 'Laag';
    if (score <= 10) return 'Gemiddeld';
    if (score <= 15) return 'Hoog';
    return 'Kritiek';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Identified': return COLORS.blue;
      case 'Assessed': return COLORS.warning;
      case 'Mitigated': return COLORS.green;
      case 'Closed': return COLORS.gray[400];
      default: return COLORS.gray[400];
    }
  };

  const filteredRisks = risks.filter(risk => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'open') return risk.status !== 'Closed' && risk.status !== 'Mitigated';
    if (filterStatus === 'mitigated') return risk.status === 'Mitigated' || risk.status === 'Closed';
    return true;
  });

  const riskStats = {
    total: risks.length,
    critical: risks.filter(r => r.score >= 16).length,
    high: risks.filter(r => r.score >= 11 && r.score <= 15).length,
    medium: risks.filter(r => r.score >= 5 && r.score <= 10).length,
    low: risks.filter(r => r.score <= 4).length,
    open: risks.filter(r => r.status !== 'Closed' && r.status !== 'Mitigated').length,
  };

  const renderRiskMatrix = () => {
    const cellSize = (width - 100) / 5;
    
    return (
      <Card style={styles.matrixCard}>
        <Text style={styles.matrixTitle}>Risk Matrix</Text>
        <Text style={styles.matrixSubtitle}>Kans vs Impact</Text>

        <View style={styles.matrixContainer}>
          {/* Y-axis label */}
          <View style={styles.yAxisLabel}>
            <Text style={styles.axisLabelText}>Kans</Text>
          </View>

          {/* Matrix Grid */}
          <View style={styles.matrixGrid}>
            {/* Y-axis labels */}
            <View style={styles.yAxisLabels}>
              {[...probabilityLevels].reverse().map((prob, index) => (
                <View key={index} style={[styles.yAxisLabelItem, { height: cellSize }]}>
                  <Text style={styles.axisText}>{prob.substring(0, 1)}</Text>
                </View>
              ))}
            </View>

            {/* Grid cells */}
            <View style={styles.gridCells}>
              {[...probabilityLevels].reverse().map((prob, probIndex) => (
                <View key={probIndex} style={styles.gridRow}>
                  {impactLevels.map((impact, impIndex) => {
                    const score = getRiskScore(prob, impact);
                    const color = getRiskScoreColor(score);
                    const cellRisks = risks.filter(
                      r => r.probability === prob && r.impact === impact && r.status !== 'Closed'
                    );

                    return (
                      <TouchableOpacity
                        key={impIndex}
                        style={[
                          styles.gridCell,
                          {
                            width: cellSize,
                            height: cellSize,
                            backgroundColor: `${color}20`,
                            borderColor: color,
                          }
                        ]}
                        onPress={() => cellRisks.length > 0 && setView('list')}
                      >
                        {cellRisks.length > 0 && (
                          <View style={[styles.riskCount, { backgroundColor: color }]}>
                            <Text style={styles.riskCountText}>{cellRisks.length}</Text>
                          </View>
                        )}
                        <Text style={[styles.cellScore, { color }]}>{score}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}

              {/* X-axis labels */}
              <View style={styles.xAxisLabels}>
                {impactLevels.map((impact, index) => (
                  <View key={index} style={[styles.xAxisLabelItem, { width: cellSize }]}>
                    <Text style={styles.axisText}>{impact.substring(0, 1)}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* X-axis label */}
          <View style={styles.xAxisLabel}>
            <Text style={styles.axisLabelText}>Impact</Text>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: COLORS.green }]} />
            <Text style={styles.legendText}>Laag (1-4)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: COLORS.warning }]} />
            <Text style={styles.legendText}>Gemiddeld (5-10)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FF8C00' }]} />
            <Text style={styles.legendText}>Hoog (11-15)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: COLORS.error }]} />
            <Text style={styles.legendText}>Kritiek (16-25)</Text>
          </View>
        </View>
      </Card>
    );
  };

  const renderRiskList = () => (
    <View style={styles.listContainer}>
      {/* Filters */}
      <View style={styles.filters}>
        <TouchableOpacity
          style={[styles.filterButton, filterStatus === 'all' && styles.filterButtonActive]}
          onPress={() => setFilterStatus('all')}
        >
          <Text style={[styles.filterButtonText, filterStatus === 'all' && styles.filterButtonTextActive]}>
            Alle ({risks.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterStatus === 'open' && styles.filterButtonActive]}
          onPress={() => setFilterStatus('open')}
        >
          <Text style={[styles.filterButtonText, filterStatus === 'open' && styles.filterButtonTextActive]}>
            Open ({riskStats.open})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterStatus === 'mitigated' && styles.filterButtonActive]}
          onPress={() => setFilterStatus('mitigated')}
        >
          <Text style={[styles.filterButtonText, filterStatus === 'mitigated' && styles.filterButtonTextActive]}>
            Gemitigeerd ({risks.length - riskStats.open})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Risk Cards */}
      {filteredRisks.map((risk) => {
        const scoreColor = getRiskScoreColor(risk.score);
        const scoreLabel = getRiskScoreLabel(risk.score);

        return (
          <Card key={risk.id} style={styles.riskCard}>
            {/* Header */}
            <View style={styles.riskHeader}>
              <View style={styles.riskTitleContainer}>
                <Text style={styles.riskTitle}>{risk.title}</Text>
                <View style={styles.riskBadges}>
                  <View style={[styles.scoreBadge, { backgroundColor: `${scoreColor}20` }]}>
                    <Text style={[styles.scoreText, { color: scoreColor }]}>
                      {risk.score} - {scoreLabel}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(risk.status)}20` }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(risk.status) }]}>
                      {risk.status}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Description */}
            <Text style={styles.riskDescription} numberOfLines={2}>
              {risk.description}
            </Text>

            {/* Metrics */}
            <View style={styles.riskMetrics}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Kans</Text>
                <View style={[styles.metricValue, { backgroundColor: `${scoreColor}20` }]}>
                  <Text style={[styles.metricValueText, { color: scoreColor }]}>
                    {risk.probability}
                  </Text>
                </View>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Impact</Text>
                <View style={[styles.metricValue, { backgroundColor: `${scoreColor}20` }]}>
                  <Text style={[styles.metricValueText, { color: scoreColor }]}>
                    {risk.impact}
                  </Text>
                </View>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Categorie</Text>
                <View style={styles.metricValue}>
                  <Text style={styles.metricValueText}>{risk.category}</Text>
                </View>
              </View>
            </View>

            {/* Details */}
            <View style={styles.riskDetails}>
              {risk.owner && (
                <View style={styles.detailItem}>
                  <Ionicons name="person-outline" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.detailText}>{risk.owner.name}</Text>
                </View>
              )}
              {risk.project && (
                <View style={styles.detailItem}>
                  <Ionicons name="folder-outline" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.detailText}>{risk.project.name}</Text>
                </View>
              )}
              <View style={styles.detailItem}>
                <Ionicons name="calendar-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>
                  {new Date(risk.identifiedDate).toLocaleDateString('nl-NL', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </Text>
              </View>
            </View>

            {/* Mitigation */}
            {risk.mitigation && (
              <View style={styles.mitigationContainer}>
                <View style={styles.mitigationHeader}>
                  <Ionicons name="shield-checkmark" size={16} color={COLORS.green} />
                  <Text style={styles.mitigationLabel}>Mitigatie:</Text>
                </View>
                <Text style={styles.mitigationText} numberOfLines={2}>
                  {risk.mitigation}
                </Text>
              </View>
            )}

            {/* Actions */}
            <View style={styles.riskActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="create-outline" size={18} color={COLORS.purple} />
                <Text style={styles.actionButtonText}>Bewerken</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-outline" size={18} color={COLORS.blue} />
                <Text style={styles.actionButtonText}>Delen</Text>
              </TouchableOpacity>
            </View>
          </Card>
        );
      })}

      {filteredRisks.length === 0 && (
        <View style={styles.emptyList}>
          <Ionicons name="shield-checkmark-outline" size={64} color={COLORS.gray[300]} />
          <Text style={styles.emptyListText}>Geen risico's gevonden</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={COLORS.primaryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Risk Management</Text>
            <Text style={styles.headerSubtitle}>{risks.length} geïdentificeerde risico's</Text>
          </View>
          <TouchableOpacity
            style={styles.viewToggle}
            onPress={() => setView(view === 'matrix' ? 'list' : 'matrix')}
          >
            <Ionicons
              name={view === 'matrix' ? 'list' : 'grid'}
              size={24}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{riskStats.critical}</Text>
            <Text style={styles.statLabel}>Kritiek</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{riskStats.high}</Text>
            <Text style={styles.statLabel}>Hoog</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{riskStats.medium}</Text>
            <Text style={styles.statLabel}>Gemiddeld</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{riskStats.low}</Text>
            <Text style={styles.statLabel}>Laag</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadRisks} />
        }
      >
        {view === 'matrix' ? renderRiskMatrix() : renderRiskList()}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab}>
        <LinearGradient colors={COLORS.primaryGradient} style={styles.fabGradient}>
          <Ionicons name="add" size={28} color={COLORS.white} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 4,
  },
  viewToggle: {
    padding: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.white,
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  matrixCard: {
    padding: 16,
  },
  matrixTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  matrixSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  matrixContainer: {
    alignItems: 'center',
  },
  yAxisLabel: {
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: [{ rotate: '-90deg' }],
  },
  axisLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  matrixGrid: {
    flexDirection: 'row',
    marginLeft: 40,
  },
  yAxisLabels: {
    marginRight: 8,
  },
  yAxisLabelItem: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  axisText: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  gridCells: {
    flex: 1,
  },
  gridRow: {
    flexDirection: 'row',
  },
  gridCell: {
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  riskCount: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  riskCountText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  cellScore: {
    fontSize: 11,
    fontWeight: '600',
  },
  xAxisLabels: {
    flexDirection: 'row',
    marginTop: 8,
  },
  xAxisLabelItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  xAxisLabel: {
    marginTop: 20,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  listContainer: {
    flex: 1,
  },
  filters: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 4,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  filterButtonActive: {
    backgroundColor: COLORS.purple,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  riskCard: {
    marginBottom: 16,
  },
  riskHeader: {
    marginBottom: 12,
  },
  riskTitleContainer: {
    marginBottom: 8,
  },
  riskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  riskBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  riskDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  riskMetrics: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metricItem: {
    flex: 1,
    marginRight: 8,
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  metricValue: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: COLORS.gray[100],
  },
  metricValueText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  riskDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  mitigationContainer: {
    backgroundColor: `${COLORS.green}10`,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  mitigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  mitigationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.green,
    marginLeft: 6,
  },
  mitigationText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  riskActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.purple,
    marginLeft: 6,
  },
  emptyList: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyListText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    borderRadius: 28,
    elevation: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
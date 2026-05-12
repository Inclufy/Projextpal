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
import { COLORS } from '../../constants/colors';
import {
  budgetService,
  Budget,
  ProjectBudget,
  BudgetCategory,
} from '../../services/budgetService';

type BudgetDetailRouteParams = {
  BudgetDetail: { budgetId?: string; projectId?: string; projectName?: string };
};

interface BudgetDetailView {
  id: string;
  projectName: string;
  totalBudget: number;
  spent: number;
  remaining: number;
  currency: string;
  categories: BudgetCategory[];
  lastUpdated: string;
}

const CATEGORY_PALETTE = [
  COLORS.purple,
  COLORS.blue,
  COLORS.green,
  COLORS.orange,
  COLORS.pink,
  COLORS.gray[400],
];

export const BudgetDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<BudgetDetailRouteParams, 'BudgetDetail'>>();
  const { t, isNL } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [budget, setBudget] = useState<BudgetDetailView | null>(null);
  const [error, setError] = useState<string | null>(null);

  const projectId = route.params?.projectId;
  const projectNameHint = route.params?.projectName;

  const toView = (
    pb: ProjectBudget | null,
    overview: Budget | null
  ): BudgetDetailView | null => {
    if (pb) {
      return {
        id: pb.id,
        projectName: pb.project_name,
        totalBudget: pb.allocated || 0,
        spent: pb.spent || 0,
        remaining: pb.remaining || 0,
        currency: pb.currency || '€',
        categories: (pb.categories || []).map((c, i) => ({
          ...c,
          color: c.color || CATEGORY_PALETTE[i % CATEGORY_PALETTE.length],
        })),
        lastUpdated: new Date().toISOString(),
      };
    }
    if (overview) {
      return {
        id: overview.id,
        projectName: isNL ? 'Totaal Budget' : 'Total Budget',
        totalBudget: overview.total_budget || 0,
        spent: overview.total_spent || 0,
        remaining: overview.total_remaining || 0,
        currency: overview.currency || '€',
        categories: (overview.categories || []).map((c, i) => ({
          ...c,
          color: c.color || CATEGORY_PALETTE[i % CATEGORY_PALETTE.length],
        })),
        lastUpdated: overview.updated_at || new Date().toISOString(),
      };
    }
    return null;
  };

  const loadBudgetData = useCallback(async () => {
    try {
      setError(null);
      if (projectId) {
        const pb = await budgetService.getProjectBudget(projectId);
        setBudget(toView(pb, null));
      } else {
        const overview = await budgetService.getBudgetOverview();
        setBudget(toView(null, overview));
      }
    } catch (e) {
      console.error('Failed to load budget:', e);
      setError(isNL ? 'Kon budget niet laden' : 'Could not load budget');
      setBudget(null);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, isNL]);

  useEffect(() => {
    loadBudgetData();
  }, [loadBudgetData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBudgetData();
    setRefreshing(false);
  }, [loadBudgetData]);

  const formatCurrency = (amount: number, currency = '€') => {
    return `${currency}${(amount || 0).toLocaleString(isNL ? 'nl-NL' : 'en-US')}`;
  };

  const getPercentage = (spent: number, total: number) => {
    if (!total || total <= 0) return 0;
    return Math.round((spent / total) * 100);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.purple} />
      </View>
    );
  }

  if (error || !budget) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[COLORS.purple, COLORS.pink]}
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
            <Text style={styles.headerTitle}>{t.budgetOverview}</Text>
            {projectNameHint ? (
              <Text style={styles.headerSubtitle}>{projectNameHint}</Text>
            ) : null}
          </View>
          <View style={styles.menuButton} />
        </LinearGradient>
        <View style={styles.emptyContainer}>
          <Ionicons name="wallet-outline" size={64} color={COLORS.gray[300]} />
          <Text style={styles.emptyTitle}>
            {error || (isNL ? 'Geen budget data beschikbaar' : 'No budget data available')}
          </Text>
          <Text style={styles.emptySubtitle}>
            {isNL
              ? 'Zodra er budget gegevens beschikbaar zijn, verschijnen ze hier.'
              : 'Budget data will appear here once it is available.'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadBudgetData}>
            <Text style={styles.retryButtonText}>
              {isNL ? 'Opnieuw proberen' : 'Try again'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const spentPercentage = getPercentage(budget.spent, budget.totalBudget);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.purple, COLORS.pink]}
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
          <Text style={styles.headerTitle}>{t.budgetOverview}</Text>
          <Text style={styles.headerSubtitle}>{budget.projectName}</Text>
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
        {/* Budget Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.totalBudgetContainer}>
            <Text style={styles.totalBudgetLabel}>
              {isNL ? 'Totaal Budget' : 'Total Budget'}
            </Text>
            <Text style={styles.totalBudgetAmount}>
              {formatCurrency(budget.totalBudget, budget.currency)}
            </Text>
          </View>

          {/* Progress Ring */}
          <View style={styles.progressContainer}>
            <View style={styles.progressRing}>
              <Text style={styles.progressPercentage}>{spentPercentage}%</Text>
              <Text style={styles.progressLabel}>{t.spent}</Text>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: `${COLORS.red}15` }]}>
                <Ionicons name="arrow-up" size={16} color={COLORS.red} />
              </View>
              <Text style={styles.statLabel}>{t.spent}</Text>
              <Text style={[styles.statValue, { color: COLORS.red }]}>
                {formatCurrency(budget.spent, budget.currency)}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: `${COLORS.green}15` }]}>
                <Ionicons name="wallet" size={16} color={COLORS.green} />
              </View>
              <Text style={styles.statLabel}>{t.remaining}</Text>
              <Text style={[styles.statValue, { color: COLORS.green }]}>
                {formatCurrency(budget.remaining, budget.currency)}
              </Text>
            </View>
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.categories}</Text>
          {budget.categories.length === 0 ? (
            <View style={styles.categoriesEmpty}>
              <Ionicons name="pricetags-outline" size={32} color={COLORS.gray[300]} />
              <Text style={styles.categoriesEmptyText}>
                {isNL
                  ? 'Nog geen categorieën gedefinieerd'
                  : 'No categories defined yet'}
              </Text>
            </View>
          ) : (
            budget.categories.map((category) => {
              const catPercentage = getPercentage(
                category.spent || 0,
                category.allocated || 0
              );
              return (
                <View key={category.id} style={styles.categoryCard}>
                  <View style={styles.categoryHeader}>
                    <View style={styles.categoryInfo}>
                      <View
                        style={[
                          styles.categoryDot,
                          { backgroundColor: category.color || COLORS.purple },
                        ]}
                      />
                      <Text style={styles.categoryName}>{category.name}</Text>
                    </View>
                    <Text style={styles.categoryPercentage}>{catPercentage}%</Text>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBackground}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${Math.min(catPercentage, 100)}%`,
                            backgroundColor: category.color || COLORS.purple,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.categoryAmounts}>
                    <Text style={styles.categorySpent}>
                      {formatCurrency(category.spent || 0, budget.currency)}{' '}
                      {t.spent.toLowerCase()}
                    </Text>
                    <Text style={styles.categoryAllocated}>
                      {isNL ? 'van' : 'of'}{' '}
                      {formatCurrency(category.allocated || 0, budget.currency)}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Last Updated */}
        <Text style={styles.lastUpdated}>
          {isNL ? 'Laatst bijgewerkt:' : 'Last updated:'}{' '}
          {new Date(budget.lastUpdated).toLocaleDateString(isNL ? 'nl-NL' : 'en-US')}
        </Text>
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
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
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
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  totalBudgetContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  totalBudgetLabel: {
    fontSize: 14,
    color: COLORS.gray[500],
    marginBottom: 4,
  },
  totalBudgetAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.gray[900],
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  progressRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: COLORS.purple,
    backgroundColor: `${COLORS.purple}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercentage: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.purple,
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.gray[500],
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: COLORS.gray[200],
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
  categoriesEmpty: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  categoriesEmptyText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.gray[500],
  },
  categoryCard: {
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
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[800],
  },
  categoryPercentage: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray[600],
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: COLORS.gray[100],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  categoryAmounts: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categorySpent: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[700],
  },
  categoryAllocated: {
    fontSize: 14,
    color: COLORS.gray[500],
    marginLeft: 4,
  },
  lastUpdated: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.gray[400],
    marginTop: 24,
    marginBottom: 32,
  },
});

export default BudgetDetailScreen;

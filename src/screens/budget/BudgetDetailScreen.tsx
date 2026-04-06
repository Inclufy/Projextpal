import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useLanguage } from '../../contexts/LanguageContext';
import { COLORS } from '../../constants/colors';

const { width } = Dimensions.get('window');

type BudgetDetailRouteParams = {
  BudgetDetail: { budgetId: string };
};

interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  color: string;
}

interface BudgetData {
  id: string;
  projectName: string;
  totalBudget: number;
  spent: number;
  remaining: number;
  currency: string;
  categories: BudgetCategory[];
  lastUpdated: string;
}

export const BudgetDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<BudgetDetailRouteParams, 'BudgetDetail'>>();
  const { t, isNL } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState<BudgetData | null>(null);

  useEffect(() => {
    loadBudgetData();
  }, []);

  const loadBudgetData = async () => {
    // Simulated API call - replace with actual API
    setTimeout(() => {
      setBudget({
        id: route.params?.budgetId || '1',
        projectName: 'Digital Transformation',
        totalBudget: 150000,
        spent: 87500,
        remaining: 62500,
        currency: '€',
        categories: [
          { id: '1', name: isNL ? 'Personeel' : 'Personnel', allocated: 80000, spent: 52000, color: COLORS.purple },
          { id: '2', name: isNL ? 'Software' : 'Software', allocated: 30000, spent: 18500, color: COLORS.blue },
          { id: '3', name: isNL ? 'Hardware' : 'Hardware', allocated: 20000, spent: 12000, color: COLORS.green },
          { id: '4', name: isNL ? 'Training' : 'Training', allocated: 15000, spent: 5000, color: COLORS.orange },
          { id: '5', name: isNL ? 'Overig' : 'Other', allocated: 5000, spent: 0, color: COLORS.gray[400] },
        ],
        lastUpdated: new Date().toISOString(),
      });
      setLoading(false);
    }, 500);
  };

  const formatCurrency = (amount: number) => {
    return `€${amount.toLocaleString('nl-NL')}`;
  };

  const getPercentage = (spent: number, total: number) => {
    return Math.round((spent / total) * 100);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.purple} />
      </View>
    );
  }

  if (!budget) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color={COLORS.red} />
        <Text style={styles.errorText}>{t.error}</Text>
      </View>
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Budget Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.totalBudgetContainer}>
            <Text style={styles.totalBudgetLabel}>
              {isNL ? 'Totaal Budget' : 'Total Budget'}
            </Text>
            <Text style={styles.totalBudgetAmount}>
              {formatCurrency(budget.totalBudget)}
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
                {formatCurrency(budget.spent)}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: `${COLORS.green}15` }]}>
                <Ionicons name="wallet" size={16} color={COLORS.green} />
              </View>
              <Text style={styles.statLabel}>{t.remaining}</Text>
              <Text style={[styles.statValue, { color: COLORS.green }]}>
                {formatCurrency(budget.remaining)}
              </Text>
            </View>
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.categories}</Text>
          {budget.categories.map((category) => {
            const catPercentage = getPercentage(category.spent, category.allocated);
            return (
              <View key={category.id} style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryInfo}>
                    <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
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
                          width: `${catPercentage}%`,
                          backgroundColor: category.color,
                        }
                      ]} 
                    />
                  </View>
                </View>
                
                <View style={styles.categoryAmounts}>
                  <Text style={styles.categorySpent}>
                    {formatCurrency(category.spent)} {t.spent.toLowerCase()}
                  </Text>
                  <Text style={styles.categoryAllocated}>
                    {isNL ? 'van' : 'of'} {formatCurrency(category.allocated)}
                  </Text>
                </View>
              </View>
            );
          })}
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

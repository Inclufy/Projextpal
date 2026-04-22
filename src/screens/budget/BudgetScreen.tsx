import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { budgetService, Budget } from '../../services/budgetService';

export const BudgetScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBudget();
  }, []);

  const loadBudget = async () => {
    try {
      setLoading(true);
      const data = await budgetService.getBudgetOverview();
      setBudget(data);
    } catch (error) {
      console.error('Failed to load budget:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `€${amount.toLocaleString('nl-NL')}`;
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#10B981', '#3B82F6']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Budget</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      ) : budget ? (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Totaal Budget</Text>
            <Text style={styles.summaryAmount}>{formatCurrency(budget.total_budget || 0)}</Text>
            
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Uitgegeven</Text>
                <Text style={[styles.summaryValue, { color: '#EF4444' }]}>
                  {formatCurrency(budget.total_spent || 0)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Resterend</Text>
                <Text style={[styles.summaryValue, { color: '#10B981' }]}>
                  {formatCurrency(budget.total_remaining || 0)}
                </Text>
              </View>
            </View>
          </View>

          {budget.projects && budget.projects.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Project Budgetten</Text>
              {budget.projects.map((project) => (
                <View key={project.id} style={styles.projectCard}>
                  <Text style={styles.projectName}>{project.project_name}</Text>
                  <View style={styles.projectBudget}>
                    <View style={styles.budgetRow}>
                      <Text style={styles.budgetLabel}>Budget:</Text>
                      <Text style={styles.budgetValue}>{formatCurrency(project.allocated)}</Text>
                    </View>
                    <View style={styles.budgetRow}>
                      <Text style={styles.budgetLabel}>Uitgegeven:</Text>
                      <Text style={[styles.budgetValue, { color: '#EF4444' }]}>
                        {formatCurrency(project.spent)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="wallet-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyText}>Geen budget data beschikbaar</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  backButton: { padding: 8 },
  title: { flex: 1, fontSize: 24, fontWeight: 'bold', color: 'white', textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20 },
  summaryCard: { backgroundColor: 'white', borderRadius: 20, padding: 24, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  summaryTitle: { fontSize: 16, color: '#6B7280', marginBottom: 8 },
  summaryAmount: { fontSize: 36, fontWeight: 'bold', color: '#1F2937', marginBottom: 20 },
  summaryGrid: { flexDirection: 'row', gap: 16 },
  summaryItem: { flex: 1 },
  summaryLabel: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  summaryValue: { fontSize: 20, fontWeight: '600' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 },
  projectCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  projectName: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 12 },
  projectBudget: { gap: 8 },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between' },
  budgetLabel: { fontSize: 14, color: '#6B7280' },
  budgetValue: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#9CA3AF', marginTop: 16 },
});

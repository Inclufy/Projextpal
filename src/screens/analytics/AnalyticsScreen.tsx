import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { analyticsService, AnalyticsData } from '../../services/analyticsService';

export const AnalyticsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isNL } = useLanguage();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadAnalytics(); }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const result = await analyticsService.getAnalytics();
      setData(result);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  }, []);

  const getPercentage = (part: number, total: number) => total > 0 ? Math.round((part / total) * 100) : 0;

  const ProgressBar = ({ value, total, color }: { value: number; total: number; color: string }) => {
    const pct = getPercentage(value, total);
    return (
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: color }]} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#F97316', '#FB923C']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Analytics</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F97316" />
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F97316']} />}
        >
          {/* Project Stats */}
          <Text style={styles.sectionTitle}>{isNL ? 'Projecten' : 'Projects'}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <LinearGradient colors={['#8B5CF6', '#A855F7']} style={styles.statIcon}>
                <Ionicons name="folder" size={20} color="white" />
              </LinearGradient>
              <Text style={styles.statNumber}>{data?.total_projects || 0}</Text>
              <Text style={styles.statLabel}>{isNL ? 'Totaal' : 'Total'}</Text>
            </View>
            <View style={styles.statCard}>
              <LinearGradient colors={['#10B981', '#059669']} style={styles.statIcon}>
                <Ionicons name="checkmark-circle" size={20} color="white" />
              </LinearGradient>
              <Text style={styles.statNumber}>{data?.completed_projects || 0}</Text>
              <Text style={styles.statLabel}>{isNL ? 'Klaar' : 'Done'}</Text>
            </View>
          </View>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>{isNL ? 'Voortgang' : 'Progress'}</Text>
              <Text style={styles.progressValue}>{getPercentage(data?.completed_projects || 0, data?.total_projects || 1)}%</Text>
            </View>
            <ProgressBar value={data?.completed_projects || 0} total={data?.total_projects || 1} color="#8B5CF6" />
          </View>

          {/* Task Stats */}
          <Text style={styles.sectionTitle}>{isNL ? 'Taken' : 'Tasks'}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.statIcon}>
                <Ionicons name="list" size={20} color="white" />
              </LinearGradient>
              <Text style={styles.statNumber}>{data?.total_tasks || 0}</Text>
              <Text style={styles.statLabel}>{isNL ? 'Totaal' : 'Total'}</Text>
            </View>
            <View style={styles.statCard}>
              <LinearGradient colors={['#10B981', '#059669']} style={styles.statIcon}>
                <Ionicons name="checkmark-done" size={20} color="white" />
              </LinearGradient>
              <Text style={styles.statNumber}>{data?.completed_tasks || 0}</Text>
              <Text style={styles.statLabel}>{isNL ? 'Klaar' : 'Done'}</Text>
            </View>
          </View>
          {(data?.overdue_tasks || 0) > 0 && (
            <View style={styles.alertCard}>
              <Ionicons name="alert-circle" size={20} color="#DC2626" />
              <Text style={styles.alertText}>{data?.overdue_tasks} {isNL ? 'taken over deadline' : 'overdue tasks'}</Text>
            </View>
          )}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>{isNL ? 'Afgerond' : 'Completed'}</Text>
              <Text style={styles.progressValue}>{getPercentage(data?.completed_tasks || 0, data?.total_tasks || 1)}%</Text>
            </View>
            <ProgressBar value={data?.completed_tasks || 0} total={data?.total_tasks || 1} color="#3B82F6" />
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: 'white', flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginTop: 24, marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  statIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#1F2937' },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  progressCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginTop: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  progressValue: { fontSize: 14, fontWeight: 'bold', color: '#1F2937' },
  progressBar: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  alertCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', borderRadius: 10, padding: 12, marginTop: 12, gap: 8 },
  alertText: { fontSize: 13, color: '#991B1B', fontWeight: '500' },
});

export default AnalyticsScreen;

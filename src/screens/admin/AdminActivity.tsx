import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { adminService, Activity } from '../../services/adminService';

export const AdminActivity: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState({ today: 0, this_week: 0, this_month: 0 });
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('week');

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [activitiesData, statsData] = await Promise.all([
        adminService.getActivities({ period: selectedPeriod }),
        adminService.getActivityStats(),
      ]);
      setActivities(activitiesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading activities:', error);
      Alert.alert('Error', 'Failed to load activity data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [selectedPeriod]);

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('nl-NL', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Loading activities...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8B5CF6']} />}
    >
      <Text style={styles.pageTitle}>📝 {t('activity.title')}</Text>
      <Text style={styles.pageSubtitle}>{t('activity.subtitle')}</Text>
      
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats.today}</Text>
          <Text style={styles.statLabel}>{t('activity.today')}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats.this_week}</Text>
          <Text style={styles.statLabel}>{t('activity.thisWeek')}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats.this_month >= 1000 ? `${(stats.this_month / 1000).toFixed(1)}K` : stats.this_month}</Text>
          <Text style={styles.statLabel}>{t('activity.thisMonth')}</Text>
        </View>
      </View>

      {/* Period Filter */}
      <View style={styles.filterRow}>
        {[
          { key: 'today', label: t('activity.today') },
          { key: 'week', label: t('activity.thisWeek') },
          { key: 'month', label: t('activity.thisMonth') },
        ].map((period) => (
          <TouchableOpacity
            key={period.key}
            style={[styles.filterButton, selectedPeriod === period.key && styles.filterButtonActive]}
            onPress={() => setSelectedPeriod(period.key as any)}
          >
            <Text style={[styles.filterButtonText, selectedPeriod === period.key && styles.filterButtonTextActive]}>
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>{t('activity.timeline')}</Text>
      
      {activities.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyText}>No activities found</Text>
        </View>
      ) : (
        <View style={styles.timeline}>
          {activities.map((activity, index) => (
            <View key={activity.id} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View style={[styles.timelineIcon, { backgroundColor: activity.color }]}>
                  <Ionicons name={activity.icon as any} size={18} color="white" />
                </View>
                {index < activities.length - 1 && <View style={styles.timelineLine} />}
              </View>
              
              <View style={styles.activityCard}>
                <Text style={styles.activityAction}>{activity.action}</Text>
                <View style={styles.activityMeta}>
                  <Ionicons name="person" size={14} color="#6B7280" />
                  <Text style={styles.activityUser}>{activity.user}</Text>
                  <Text style={styles.activityTime}> • {formatTimestamp(activity.timestamp)}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { fontSize: 16, color: '#6B7280', marginTop: 16 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  pageSubtitle: { fontSize: 15, color: '#6B7280', marginBottom: 20 },
  
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statBox: { flex: 1, backgroundColor: 'white', borderRadius: 12, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3 },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#6B7280' },

  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 24, backgroundColor: 'white', borderRadius: 12, padding: 4 },
  filterButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  filterButtonActive: { backgroundColor: '#8B5CF6' },
  filterButtonText: { fontSize: 13, fontWeight: '500', color: '#6B7280' },
  filterButtonTextActive: { color: 'white', fontWeight: '600' },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 },
  
  emptyState: { alignItems: 'center', paddingVertical: 64 },
  emptyText: { fontSize: 16, color: '#6B7280', marginTop: 16 },
  
  timeline: { marginTop: 8 },
  timelineItem: { flexDirection: 'row', marginBottom: 24 },
  timelineLeft: { alignItems: 'center', marginRight: 16, width: 40 },
  timelineIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#E5E7EB', marginTop: 8 },
  
  activityCard: { flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3 },
  activityAction: { fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
  activityMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  activityUser: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  activityTime: { fontSize: 12, color: '#9CA3AF' },
});
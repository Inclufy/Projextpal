import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  adminService,
  DashboardStats,
  Activity,
} from '../../services/adminService';

const formatCurrency = (n: number | undefined | null) =>
  `€${Math.round(n || 0).toLocaleString('nl-NL')}`;

const formatChange = (pct: number | undefined | null): string => {
  if (pct == null || isNaN(pct)) return '—';
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}% vs vorige maand`;
};

const formatTimestamp = (timestamp: string): string => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return timestamp;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  if (diffMins < 1) return 'zojuist';
  if (diffMins < 60) return `${diffMins} min geleden`;
  if (diffHours < 24) return `${diffHours} uur geleden`;
  return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
};

export const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [statsRes, activityRes] = await Promise.allSettled([
        adminService.getDashboardStats(),
        adminService.getActivities(),
      ]);
      setStats(statsRes.status === 'fulfilled' ? statsRes.value : null);
      setRecentActivity(
        activityRes.status === 'fulfilled' ? activityRes.value.slice(0, 5) : []
      );
      if (statsRes.status === 'rejected' && activityRes.status === 'rejected') {
        setError('Kon admin dashboard niet laden');
      }
    } catch (e) {
      console.error('AdminDashboard load failed:', e);
      setError('Kon admin dashboard niet laden');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Dashboard laden…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8B5CF6']} />
      }
    >
      <Text style={styles.pageTitle}>📊 Dashboard Overview</Text>
      <Text style={styles.pageSubtitle}>Real-time statistieken en inzichten</Text>

      {error ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={20} color="#B91C1C" />
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      ) : null}

      {/* Key Metrics */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <LinearGradient colors={['#8B5CF6', '#A855F7']} style={styles.metricIconBg}>
            <Ionicons name="people" size={32} color="white" />
          </LinearGradient>
          <View style={styles.metricInfo}>
            <Text style={styles.metricValue}>{stats?.total_users ?? 0}</Text>
            <Text style={styles.metricLabel}>Totaal Gebruikers</Text>
            <View style={styles.changePositive}>
              <Ionicons name="trending-up" size={14} color="#10B981" />
              <Text style={styles.changeText}>{formatChange(stats?.user_growth)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.metricCard}>
          <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.metricIconBg}>
            <Ionicons name="business" size={32} color="white" />
          </LinearGradient>
          <View style={styles.metricInfo}>
            <Text style={styles.metricValue}>{stats?.total_organizations ?? 0}</Text>
            <Text style={styles.metricLabel}>Organisaties</Text>
            <View style={styles.changePositive}>
              <Ionicons name="trending-up" size={14} color="#10B981" />
              <Text style={styles.changeText}>{formatChange(stats?.org_growth)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.metricCard}>
          <LinearGradient colors={['#10B981', '#059669']} style={styles.metricIconBg}>
            <Ionicons name="cash" size={32} color="white" />
          </LinearGradient>
          <View style={styles.metricInfo}>
            <Text style={styles.metricValue}>{formatCurrency(stats?.mrr)}</Text>
            <Text style={styles.metricLabel}>Monthly Recurring Revenue</Text>
            <View style={styles.changePositive}>
              <Ionicons name="trending-up" size={14} color="#10B981" />
              <Text style={styles.changeText}>{formatChange(stats?.mrr_growth)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.metricCard}>
          <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.metricIconBg}>
            <Ionicons name="card" size={32} color="white" />
          </LinearGradient>
          <View style={styles.metricInfo}>
            <Text style={styles.metricValue}>{stats?.active_subscriptions ?? 0}</Text>
            <Text style={styles.metricLabel}>Actieve Abonnementen</Text>
            <View style={styles.changePositive}>
              <Ionicons name="trending-up" size={14} color="#10B981" />
              <Text style={styles.changeText}>
                {formatChange(stats?.subscription_growth)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity style={styles.quickActionCard}>
          <LinearGradient colors={['#8B5CF6', '#EC4899']} style={styles.quickActionGradient}>
            <Ionicons name="person-add" size={28} color="white" />
            <Text style={styles.quickActionText}>Nieuwe Gebruiker</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickActionCard}>
          <LinearGradient colors={['#3B82F6', '#8B5CF6']} style={styles.quickActionGradient}>
            <Ionicons name="business" size={28} color="white" />
            <Text style={styles.quickActionText}>Nieuwe Organisatie</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickActionCard}>
          <LinearGradient colors={['#10B981', '#3B82F6']} style={styles.quickActionGradient}>
            <Ionicons name="document-text" size={28} color="white" />
            <Text style={styles.quickActionText}>Genereer Rapport</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickActionCard}>
          <LinearGradient colors={['#F59E0B', '#EC4899']} style={styles.quickActionGradient}>
            <Ionicons name="settings" size={28} color="white" />
            <Text style={styles.quickActionText}>Systeem Config</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Admin Modules — counts derived from live stats */}
      <Text style={styles.sectionTitle}>🎯 Admin Modules</Text>
      <View style={styles.modulesGrid}>
        {([
          {
            icon: 'people',
            title: 'Gebruikers',
            subtitle: 'Beheer alle gebruikers',
            count: stats?.total_users != null ? String(stats.total_users) : '-',
            colors: ['#8B5CF6', '#EC4899'],
          },
          {
            icon: 'business',
            title: 'Organisaties',
            subtitle: 'Beheer organisaties',
            count: stats?.total_organizations != null ? String(stats.total_organizations) : '-',
            colors: ['#3B82F6', '#8B5CF6'],
          },
          {
            icon: 'card',
            title: 'Abonnementen',
            subtitle: 'Beheer abonnementen',
            count: stats?.active_subscriptions != null ? String(stats.active_subscriptions) : '-',
            colors: ['#F59E0B', '#EC4899'],
          },
          {
            icon: 'settings',
            title: 'Instellingen',
            subtitle: 'Systeem configuratie',
            count: '-',
            colors: ['#6B7280', '#4B5563'],
          },
        ] as Array<{
          icon: keyof typeof Ionicons.glyphMap;
          title: string;
          subtitle: string;
          count: string;
          colors: [string, string];
        }>).map((module, index) => (
          <TouchableOpacity key={index} style={styles.moduleCard}>
            <LinearGradient colors={module.colors} style={styles.moduleIcon}>
              <Ionicons name={module.icon} size={28} color="white" />
            </LinearGradient>
            <View style={styles.moduleContent}>
              <View style={styles.moduleHeader}>
                <Text style={styles.moduleTitle}>{module.title}</Text>
                {module.count !== '-' && (
                  <View style={styles.moduleBadge}>
                    <Text style={styles.moduleBadgeText}>{module.count}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.moduleSubtitle}>{module.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Activity Preview */}
      <Text style={styles.sectionTitle}>📋 Recente Activiteit</Text>
      <View style={styles.activityPreview}>
        {recentActivity.length === 0 ? (
          <View style={styles.emptyActivity}>
            <Ionicons name="time-outline" size={32} color="#D1D5DB" />
            <Text style={styles.emptyActivityText}>Geen recente activiteit</Text>
          </View>
        ) : (
          recentActivity.map((activity) => (
            <View key={activity.id} style={styles.activityPreviewItem}>
              <View
                style={[
                  styles.activityIconSmall,
                  { backgroundColor: activity.color || '#6B7280' },
                ]}
              >
                <Ionicons
                  name={(activity.icon as keyof typeof Ionicons.glyphMap) || 'ellipse'}
                  size={16}
                  color="white"
                />
              </View>
              <View style={styles.activityPreviewContent}>
                <Text style={styles.activityPreviewAction}>{activity.action}</Text>
                <Text style={styles.activityPreviewMeta}>
                  {activity.user} • {formatTimestamp(activity.timestamp)}
                </Text>
              </View>
            </View>
          ))
        )}
        {recentActivity.length > 0 ? (
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>Bekijk alle activiteit</Text>
            <Ionicons name="arrow-forward" size={16} color="#8B5CF6" />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, backgroundColor: '#f5f5f5' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280' },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, padding: 12, backgroundColor: '#FEE2E2', borderRadius: 12 },
  errorBannerText: { color: '#B91C1C', fontSize: 13, fontWeight: '500', flex: 1 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  pageSubtitle: { fontSize: 15, color: '#6B7280', marginBottom: 24 },

  metricsGrid: { gap: 16, marginBottom: 24 },
  metricCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  metricIconBg: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  metricInfo: { flex: 1 },
  metricValue: { fontSize: 32, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  metricLabel: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  changePositive: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  changeText: { fontSize: 12, color: '#10B981', fontWeight: '600' },

  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginTop: 8, marginBottom: 16 },

  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  quickActionCard: { width: '48%', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  quickActionGradient: { padding: 20, alignItems: 'center', gap: 12 },
  quickActionText: { fontSize: 13, fontWeight: '600', color: 'white', textAlign: 'center' },

  modulesGrid: { gap: 12, marginBottom: 24 },
  moduleCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3 },
  moduleIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  moduleContent: { flex: 1 },
  moduleHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  moduleTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  moduleBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  moduleBadgeText: { fontSize: 12, fontWeight: 'bold', color: '#1F2937' },
  moduleSubtitle: { fontSize: 12, color: '#6B7280' },

  activityPreview: { backgroundColor: 'white', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3 },
  emptyActivity: { alignItems: 'center', paddingVertical: 24 },
  emptyActivityText: { marginTop: 8, fontSize: 13, color: '#9CA3AF' },
  activityPreviewItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  activityIconSmall: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  activityPreviewContent: { flex: 1 },
  activityPreviewAction: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  activityPreviewMeta: { fontSize: 12, color: '#6B7280' },
  viewAllButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, gap: 8 },
  viewAllText: { fontSize: 14, fontWeight: '600', color: '#8B5CF6' },
});

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
  AdminUser,
  Activity,
  SystemInfo,
} from '../../services/adminService';

type TabKey = 'dashboard' | 'users' | 'activity' | 'system';

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
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'zojuist';
  if (diffMins < 60) return `${diffMins} min geleden`;
  if (diffHours < 24) return `${diffHours} uur geleden`;
  if (diffDays < 7) return `${diffDays} dag(en) geleden`;
  return date.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const AdminPortalScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);

  const loadAll = useCallback(async () => {
    try {
      setError(null);
      const [statsRes, usersRes, activitiesRes, systemRes] = await Promise.allSettled([
        adminService.getDashboardStats(),
        adminService.getUsers(),
        adminService.getActivities(),
        adminService.getSystemInfo(),
      ]);
      setStats(statsRes.status === 'fulfilled' ? statsRes.value : null);
      setUsers(usersRes.status === 'fulfilled' ? usersRes.value : []);
      setActivities(activitiesRes.status === 'fulfilled' ? activitiesRes.value : []);
      setSystemInfo(systemRes.status === 'fulfilled' ? systemRes.value : null);
      const allFailed = [statsRes, usersRes, activitiesRes, systemRes].every(
        (r) => r.status === 'rejected'
      );
      if (allFailed) {
        setError('Kon admin gegevens niet laden');
      }
    } catch (e) {
      console.error('AdminPortal load failed:', e);
      setError('Kon admin gegevens niet laden');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  }, [loadAll]);

  const handleTabPress = (tab: TabKey) => setActiveTab(tab);

  const EmptyBlock = ({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) => (
    <View style={styles.emptyBlock}>
      <Ionicons name={icon} size={48} color="#D1D5DB" />
      <Text style={styles.emptyBlockText}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1F2937', '#111827']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>ProjeXtPal Admin</Text>
          <Text style={styles.subtitle}>Superadmin Dashboard</Text>
        </View>
        <View style={styles.adminBadge}>
          <Ionicons name="shield-checkmark" size={20} color="#F59E0B" />
        </View>
      </LinearGradient>

      {/* Tabs Bar */}
      <View style={styles.tabsBar}>
        {([
          { key: 'dashboard', icon: 'speedometer', label: 'Dashboard' },
          { key: 'users', icon: 'people', label: 'Users' },
          { key: 'activity', icon: 'time', label: 'Activity' },
          { key: 'system', icon: 'server', label: 'System' },
        ] as Array<{ key: TabKey; icon: keyof typeof Ionicons.glyphMap; label: string }>).map(
          (tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
              onPress={() => handleTabPress(tab.key)}
            >
              <Ionicons
                name={tab.icon}
                size={20}
                color={activeTab === tab.key ? 'white' : '#6B7280'}
              />
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === tab.key && styles.tabButtonTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Admin gegevens laden…</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#8B5CF6']}
            />
          }
        >
          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={20} color="#B91C1C" />
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          ) : null}

          {/* ==================== DASHBOARD TAB ==================== */}
          {activeTab === 'dashboard' ? (
            <View style={styles.tabContent}>
              <Text style={styles.pageTitle}>📊 Dashboard Overview</Text>

              {/* Stats */}
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <LinearGradient colors={['#8B5CF6', '#A855F7']} style={styles.statGradient}>
                    <Ionicons name="people" size={28} color="white" />
                  </LinearGradient>
                  <Text style={styles.statNumber}>{stats?.total_users ?? 0}</Text>
                  <Text style={styles.statLabel}>Totaal Gebruikers</Text>
                  <Text style={styles.statChange}>{formatChange(stats?.user_growth)}</Text>
                </View>

                <View style={styles.statBox}>
                  <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.statGradient}>
                    <Ionicons name="business" size={28} color="white" />
                  </LinearGradient>
                  <Text style={styles.statNumber}>{stats?.total_organizations ?? 0}</Text>
                  <Text style={styles.statLabel}>Organisaties</Text>
                  <Text style={styles.statChange}>{formatChange(stats?.org_growth)}</Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <LinearGradient colors={['#10B981', '#059669']} style={styles.statGradient}>
                    <Ionicons name="cash" size={28} color="white" />
                  </LinearGradient>
                  <Text style={styles.statNumber}>{formatCurrency(stats?.mrr)}</Text>
                  <Text style={styles.statLabel}>MRR</Text>
                  <Text style={styles.statChange}>{formatChange(stats?.mrr_growth)}</Text>
                </View>

                <View style={styles.statBox}>
                  <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.statGradient}>
                    <Ionicons name="card" size={28} color="white" />
                  </LinearGradient>
                  <Text style={styles.statNumber}>{stats?.active_subscriptions ?? 0}</Text>
                  <Text style={styles.statLabel}>Abonnementen</Text>
                  <Text style={styles.statChange}>{formatChange(stats?.subscription_growth)}</Text>
                </View>
              </View>

              {/* Modules — derived counts */}
              <Text style={styles.sectionTitle}>Admin Modules</Text>
              <View style={styles.modulesGrid}>
                {([
                  {
                    icon: 'people',
                    title: 'Gebruikers',
                    count: stats?.total_users != null ? String(stats.total_users) : '-',
                    colors: ['#8B5CF6', '#EC4899'],
                  },
                  {
                    icon: 'business',
                    title: 'Organisaties',
                    count:
                      stats?.total_organizations != null
                        ? String(stats.total_organizations)
                        : '-',
                    colors: ['#3B82F6', '#8B5CF6'],
                  },
                  {
                    icon: 'card',
                    title: 'Abonnementen',
                    count:
                      stats?.active_subscriptions != null
                        ? String(stats.active_subscriptions)
                        : '-',
                    colors: ['#F59E0B', '#EC4899'],
                  },
                ] as Array<{
                  icon: keyof typeof Ionicons.glyphMap;
                  title: string;
                  count: string;
                  colors: [string, string];
                }>).map((module, index) => (
                  <TouchableOpacity key={index} style={styles.moduleCard}>
                    <LinearGradient colors={module.colors} style={styles.moduleGradient}>
                      <Ionicons name={module.icon} size={32} color="white" />
                    </LinearGradient>
                    <Text style={styles.moduleTitle}>{module.title}</Text>
                    {module.count !== '-' && (
                      <View style={styles.moduleCountBadge}>
                        <Text style={styles.moduleCountText}>{module.count}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}

          {/* ==================== USERS TAB ==================== */}
          {activeTab === 'users' ? (
            <View style={styles.tabContent}>
              <Text style={styles.pageTitle}>👥 Gebruikers Beheer</Text>
              <Text style={styles.pageSubtitle}>Beheer alle gebruikers en hun toegang</Text>

              <TouchableOpacity style={styles.addNewButton}>
                <LinearGradient colors={['#8B5CF6', '#EC4899']} style={styles.addNewGradient}>
                  <Ionicons name="person-add" size={20} color="white" />
                  <Text style={styles.addNewText}>Nieuwe Gebruiker</Text>
                </LinearGradient>
              </TouchableOpacity>

              {users.length === 0 ? (
                <EmptyBlock icon="people-outline" label="Nog geen gebruikers geladen" />
              ) : (
                users.map((user) => (
                  <View key={user.id} style={styles.userCardLarge}>
                    <View style={styles.userCardHeader}>
                      <View style={styles.userAvatarLarge}>
                        <Text style={styles.userAvatarTextLarge}>
                          {(user.name || '?').charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.userCardInfo}>
                        <Text style={styles.userCardName}>{user.name}</Text>
                        <Text style={styles.userCardEmail}>{user.email}</Text>
                        <Text style={styles.userCardRole}>{user.role}</Text>
                      </View>
                      <View
                        style={[
                          styles.userStatusPill,
                          user.status === 'active' ? styles.statusActive : styles.statusInactive,
                        ]}
                      >
                        <Text style={styles.statusPillText}>
                          {user.status === 'active' ? 'Actief' : 'Inactief'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.userCardActions}>
                      <TouchableOpacity style={styles.userActionButton}>
                        <Ionicons name="create" size={18} color="#8B5CF6" />
                        <Text style={styles.userActionText}>Bewerken</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.userActionButton}>
                        <Ionicons name="settings" size={18} color="#6B7280" />
                        <Text style={styles.userActionText}>Rechten</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          ) : null}

          {/* ==================== ACTIVITY TAB ==================== */}
          {activeTab === 'activity' ? (
            <View style={styles.tabContent}>
              <Text style={styles.pageTitle}>📝 Recente Activiteit</Text>
              <Text style={styles.pageSubtitle}>Laatste acties in het systeem</Text>

              {activities.length === 0 ? (
                <EmptyBlock icon="time-outline" label="Geen recente activiteit" />
              ) : (
                <View style={styles.timeline}>
                  {activities.map((activity, index) => (
                    <View key={activity.id} style={styles.timelineItem}>
                      <View style={styles.timelineIconWrapper}>
                        <View
                          style={[
                            styles.timelineIcon,
                            { backgroundColor: activity.color || '#6B7280' },
                          ]}
                        >
                          <Ionicons
                            name={(activity.icon as keyof typeof Ionicons.glyphMap) || 'ellipse'}
                            size={16}
                            color="white"
                          />
                        </View>
                        {index < activities.length - 1 && <View style={styles.timelineLine} />}
                      </View>
                      <View style={styles.timelineContent}>
                        <Text style={styles.timelineAction}>{activity.action}</Text>
                        <View style={styles.timelineMeta}>
                          <Ionicons name="person" size={14} color="#6B7280" />
                          <Text style={styles.timelineUser}>{activity.user}</Text>
                          <Text style={styles.timelineTime}>
                            {' • '}
                            {formatTimestamp(activity.timestamp)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ) : null}

          {/* ==================== SYSTEM TAB ==================== */}
          {activeTab === 'system' ? (
            <View style={styles.tabContent}>
              <Text style={styles.pageTitle}>🖥️ Systeem Status</Text>

              {systemInfo ? (
                <>
                  {(() => {
                    const services = systemInfo.services || [];
                    const allOperational =
                      services.length > 0 &&
                      services.every((s) => s.status === 'operational');
                    return (
                      <View style={styles.systemHealthBanner}>
                        <Ionicons
                          name={allOperational ? 'checkmark-circle' : 'warning'}
                          size={32}
                          color={allOperational ? '#10B981' : '#F59E0B'}
                        />
                        <View style={styles.systemHealthText}>
                          <Text
                            style={[
                              styles.systemHealthTitle,
                              { color: allOperational ? '#16A34A' : '#92400E' },
                            ]}
                          >
                            {allOperational ? 'Alle Systemen Operationeel' : 'Systeem verstoord'}
                          </Text>
                          <Text style={styles.systemHealthSubtitle}>
                            {`${services.length} service(s) gemonitord`}
                          </Text>
                        </View>
                      </View>
                    );
                  })()}

                  {/* System Services */}
                  <Text style={styles.sectionTitle}>Services Status</Text>
                  {(systemInfo.services || []).length === 0 ? (
                    <EmptyBlock icon="server-outline" label="Geen services beschikbaar" />
                  ) : (
                    (systemInfo.services || []).map((service, index) => (
                      <View key={index} style={styles.serviceCard}>
                        <View style={styles.serviceHeader}>
                          <View style={styles.serviceLeft}>
                            <Ionicons name="server" size={20} color="#6B7280" />
                            <Text style={styles.serviceName}>{service.name}</Text>
                          </View>
                          <Text style={styles.serviceUptime}>{service.uptime}</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                          <View style={styles.progressBarFill} />
                        </View>
                      </View>
                    ))
                  )}

                  {/* System Info */}
                  <Text style={styles.sectionTitle}>Systeem Informatie</Text>
                  <View style={styles.infoBox}>
                    <View style={styles.infoItem}>
                      <Ionicons name="information-circle" size={20} color="#6B7280" />
                      <Text style={styles.infoLabel}>Versie</Text>
                      <Text style={styles.infoValue}>{systemInfo.version || '—'}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Ionicons name="time" size={20} color="#6B7280" />
                      <Text style={styles.infoLabel}>Last Backup</Text>
                      <Text style={styles.infoValue}>{systemInfo.last_backup || '—'}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Ionicons name="server" size={20} color="#6B7280" />
                      <Text style={styles.infoLabel}>Omgeving</Text>
                      <Text style={styles.infoValue}>
                        {systemInfo.environment ? systemInfo.environment.toUpperCase() : '—'}
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                <EmptyBlock icon="server-outline" label="Systeeminformatie niet beschikbaar" />
              )}
            </View>
          ) : null}

          <View style={{ height: 60 }} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  backButton: { padding: 8, marginRight: 12 },
  headerInfo: { flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', color: 'white' },
  subtitle: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  adminBadge: { padding: 8 },

  tabsBar: { flexDirection: 'row', backgroundColor: 'white', paddingHorizontal: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', gap: 4 },
  tabButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, backgroundColor: '#F9FAFB', gap: 4 },
  tabButtonActive: { backgroundColor: '#1F2937' },
  tabButtonText: { fontSize: 11, fontWeight: '500', color: '#6B7280' },
  tabButtonTextActive: { color: 'white', fontWeight: '700' },

  scrollContent: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280' },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20, marginTop: 16, padding: 12, backgroundColor: '#FEE2E2', borderRadius: 12 },
  errorBannerText: { color: '#B91C1C', fontSize: 13, fontWeight: '500', flex: 1 },

  tabContent: { padding: 20 },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  pageSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 20 },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statBox: { flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  statGradient: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statNumber: { fontSize: 26, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  statLabel: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  statChange: { fontSize: 11, color: '#10B981', fontWeight: '600' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginTop: 24, marginBottom: 16 },

  modulesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  moduleCard: { width: '48%', backgroundColor: 'white', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, position: 'relative' },
  moduleGradient: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  moduleTitle: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  moduleCountBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  moduleCountText: { fontSize: 12, fontWeight: 'bold', color: '#1F2937' },

  addNewButton: { marginBottom: 16, borderRadius: 12, overflow: 'hidden', shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  addNewGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
  addNewText: { fontSize: 16, fontWeight: '600', color: 'white' },

  userCardLarge: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  userCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  userAvatarLarge: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#8B5CF6', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  userAvatarTextLarge: { fontSize: 22, fontWeight: 'bold', color: 'white' },
  userCardInfo: { flex: 1 },
  userCardName: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  userCardEmail: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  userCardRole: { fontSize: 12, color: '#8B5CF6', fontWeight: '600' },
  userStatusPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusActive: { backgroundColor: '#DCFCE7' },
  statusInactive: { backgroundColor: '#FEE2E2' },
  statusPillText: { fontSize: 11, fontWeight: '700', color: '#1F2937' },
  userCardActions: { flexDirection: 'row', gap: 12 },
  userActionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB', paddingVertical: 10, borderRadius: 10, gap: 6 },
  userActionText: { fontSize: 13, fontWeight: '600', color: '#1F2937' },

  timeline: { marginTop: 8 },
  timelineItem: { flexDirection: 'row', marginBottom: 20 },
  timelineIconWrapper: { alignItems: 'center', marginRight: 16 },
  timelineIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#E5E7EB', marginTop: 4 },
  timelineContent: { flex: 1, backgroundColor: 'white', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  timelineAction: { fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
  timelineMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timelineUser: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  timelineTime: { fontSize: 12, color: '#9CA3AF' },

  systemHealthBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DCFCE7', borderRadius: 16, padding: 20, marginBottom: 24, gap: 16 },
  systemHealthText: { flex: 1 },
  systemHealthTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  systemHealthSubtitle: { fontSize: 13, color: '#059669' },

  serviceCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  serviceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  serviceLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  serviceName: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  serviceUptime: { fontSize: 14, fontWeight: 'bold', color: '#10B981' },
  progressBarBg: { height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', width: '99%', backgroundColor: '#10B981', borderRadius: 4 },

  infoBox: { backgroundColor: 'white', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  infoItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', gap: 12 },
  infoLabel: { flex: 1, fontSize: 14, color: '#6B7280' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#1F2937' },

  emptyBlock: { backgroundColor: 'white', borderRadius: 16, padding: 32, alignItems: 'center', marginTop: 8 },
  emptyBlockText: { marginTop: 12, fontSize: 14, color: '#6B7280' },
});

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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useLanguage } from '../../contexts/LanguageContext';
import { COLORS } from '../../constants/colors';
import { timeTrackingService, TimeEntry, TimeEntrySummary } from '../../services/timeTrackingService';
import { projectsService, Project } from '../../services/projects';
import { useAuthStore } from '../../store/authStore';

type TimeTrackingDetailRouteParams = {
  TimeTrackingDetail: { 
    entryId?: string;
    projectId?: string;
    period?: string;
  };
};

export const TimeTrackingDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<TimeTrackingDetailRouteParams, 'TimeTrackingDetail'>>();
  const { t, isNL } = useLanguage();
  const { user } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [summary, setSummary] = useState<TimeEntrySummary | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Check if current user is manager
  const isManager = user?.role === 'manager' || user?.role === 'admin' || project?.manager_id === user?.id;

  useEffect(() => {
    loadData();
  }, [route.params]);

  const loadData = async () => {
    try {
      setLoading(true);
      const projectId = route.params?.projectId;
      
      if (projectId) {
        // Load project-specific data
        const [projectData, entriesData] = await Promise.all([
          projectsService.getProject(projectId),
          timeTrackingService.getTimeEntriesByProject(projectId),
        ]);
        setProject(projectData);
        setEntries(entriesData);
        
        // Calculate summary
        const summaryData = calculateSummary(entriesData);
        setSummary(summaryData);
      } else {
        // Load all entries for current user
        const entriesData = await timeTrackingService.getTimeEntries();
        setEntries(entriesData);
        
        const summaryData = calculateSummary(entriesData);
        setSummary(summaryData);
      }
    } catch (error) {
      console.error('Failed to load time tracking data:', error);
      Alert.alert(t.error, isNL ? 'Kon gegevens niet laden' : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [route.params]);

  const calculateSummary = (entries: TimeEntry[]): TimeEntrySummary => {
    return {
      total_hours: entries.reduce((sum, e) => sum + (e.hours || 0), 0),
      approved_hours: entries.filter(e => e.status === 'approved').reduce((sum, e) => sum + (e.hours || 0), 0),
      pending_hours: entries.filter(e => e.status === 'pending').reduce((sum, e) => sum + (e.hours || 0), 0),
      rejected_hours: entries.filter(e => e.status === 'rejected').reduce((sum, e) => sum + (e.hours || 0), 0),
      entries_count: entries.length,
    };
  };

  const handleApprove = async (entryId: string) => {
    Alert.alert(
      isNL ? 'Uren Goedkeuren' : 'Approve Hours',
      isNL ? 'Weet je zeker dat je deze uren wilt goedkeuren?' : 'Are you sure you want to approve these hours?',
      [
        { text: isNL ? 'Annuleren' : 'Cancel', style: 'cancel' },
        {
          text: isNL ? 'Goedkeuren' : 'Approve',
          onPress: async () => {
            try {
              await timeTrackingService.updateTimeEntry(entryId, { status: 'approved' });
              Alert.alert(isNL ? 'Succes' : 'Success', isNL ? 'Uren goedgekeurd!' : 'Hours approved!');
              await loadData();
            } catch (error) {
              console.error('Failed to approve:', error);
              Alert.alert(t.error, isNL ? 'Kon niet goedkeuren' : 'Failed to approve');
            }
          },
        },
      ]
    );
  };

  const handleReject = async (entryId: string) => {
    Alert.prompt(
      isNL ? 'Uren Afkeuren' : 'Reject Hours',
      isNL ? 'Geef een reden voor afkeuring:' : 'Enter a reason for rejection:',
      [
        { text: isNL ? 'Annuleren' : 'Cancel', style: 'cancel' },
        {
          text: isNL ? 'Afkeuren' : 'Reject',
          style: 'destructive',
          onPress: async (reason: string | undefined) => {
            try {
              await timeTrackingService.updateTimeEntry(entryId, {
                status: 'rejected',
                rejection_reason: reason || (isNL ? 'Geen reden opgegeven' : 'No reason provided')
              });
              Alert.alert(isNL ? 'Afgewezen' : 'Rejected', isNL ? 'Uren zijn afgewezen' : 'Hours have been rejected');
              await loadData();
            } catch (error) {
              console.error('Failed to reject:', error);
              Alert.alert(t.error, isNL ? 'Kon niet afkeuren' : 'Failed to reject');
            }
          },
        },
      ],
      'plain-text',
      ''
    );
  };

  const handleBulkApprove = async () => {
    const pendingIds = entries.filter(e => e.status === 'pending').map(e => e.id);
    
    if (pendingIds.length === 0) {
      Alert.alert(isNL ? 'Geen uren' : 'No hours', isNL ? 'Er zijn geen uren om goed te keuren' : 'No hours to approve');
      return;
    }

    Alert.alert(
      isNL ? 'Alles Goedkeuren' : 'Approve All',
      isNL ? `Weet je zeker dat je alle ${pendingIds.length} uren wilt goedkeuren?` : `Are you sure you want to approve all ${pendingIds.length} entries?`,
      [
        { text: isNL ? 'Annuleren' : 'Cancel', style: 'cancel' },
        {
          text: isNL ? 'Goedkeuren' : 'Approve',
          onPress: async () => {
            try {
              await timeTrackingService.bulkApprove(pendingIds);
              Alert.alert(isNL ? 'Succes' : 'Success', isNL ? 'Alle uren goedgekeurd!' : 'All hours approved!');
              await loadData();
            } catch (error) {
              console.error('Failed to bulk approve:', error);
              Alert.alert(t.error, isNL ? 'Kon niet alles goedkeuren' : 'Failed to approve all');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isNL ? 'nl-NL' : 'en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved':
        return { bg: `${COLORS.green}15`, icon: 'checkmark', color: COLORS.green };
      case 'rejected':
        return { bg: '#FEE2E2', icon: 'close', color: '#DC2626' };
      default:
        return { bg: `${COLORS.orange}15`, icon: 'time', color: COLORS.orange };
    }
  };

  // Filter entries
  const filteredEntries = filter === 'all' 
    ? entries 
    : entries.filter(e => e.status === filter);

  // Count pending for badge
  const pendingCount = entries.filter(e => e.status === 'pending').length;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.purple} />
      </View>
    );
  }

  const approvalPercentage = summary 
    ? Math.round((summary.approved_hours / Math.max(summary.total_hours, 1)) * 100)
    : 0;

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
          <Text style={styles.headerTitle}>{t.timeTracking}</Text>
          <Text style={styles.headerSubtitle}>
            {project?.name || (isNL ? 'Alle Projecten' : 'All Projects')}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddTimeEntry' as never)}
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.purple]} />
        }
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.projectName}>
            {project?.name || (isNL ? 'Overzicht' : 'Overview')}
          </Text>
          
          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${COLORS.purple}15` }]}>
                <Ionicons name="time" size={20} color={COLORS.purple} />
              </View>
              <Text style={styles.statValue}>{formatHours(summary?.total_hours || 0)}</Text>
              <Text style={styles.statLabel}>
                {isNL ? 'Totaal' : 'Total'}
              </Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${COLORS.green}15` }]}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.green} />
              </View>
              <Text style={styles.statValue}>{formatHours(summary?.approved_hours || 0)}</Text>
              <Text style={styles.statLabel}>
                {isNL ? 'Goedgekeurd' : 'Approved'}
              </Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${COLORS.orange}15` }]}>
                <Ionicons name="hourglass" size={20} color={COLORS.orange} />
              </View>
              <Text style={styles.statValue}>{formatHours(summary?.pending_hours || 0)}</Text>
              <Text style={styles.statLabel}>
                {isNL ? 'In afwachting' : 'Pending'}
              </Text>
            </View>
          </View>

          {/* Approval Progress */}
          <View style={styles.approvalSection}>
            <View style={styles.approvalHeader}>
              <Text style={styles.approvalLabel}>
                {isNL ? 'Goedkeuringsstatus' : 'Approval Status'}
              </Text>
              <Text style={styles.approvalPercentage}>{approvalPercentage}%</Text>
            </View>
            <View style={styles.progressBarBackground}>
              <LinearGradient
                colors={[COLORS.green, COLORS.cyan]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressBarFill, { width: `${approvalPercentage}%` }]}
              />
            </View>
          </View>

          {/* Bulk Approve Button for Managers */}
          {isManager && pendingCount > 0 && (
            <TouchableOpacity style={styles.bulkApproveButton} onPress={handleBulkApprove}>
              <Ionicons name="checkmark-done" size={18} color={COLORS.white} />
              <Text style={styles.bulkApproveText}>
                {isNL ? `Alles goedkeuren (${pendingCount})` : `Approve all (${pendingCount})`}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.filterTab, filter === tab && styles.filterTabActive]}
              onPress={() => setFilter(tab)}
            >
              <Text style={[styles.filterTabText, filter === tab && styles.filterTabTextActive]}>
                {tab === 'all' ? (isNL ? 'Alle' : 'All') :
                 tab === 'pending' ? (isNL ? 'Wachtend' : 'Pending') :
                 tab === 'approved' ? (isNL ? 'Goedgekeurd' : 'Approved') :
                 (isNL ? 'Afgewezen' : 'Rejected')}
              </Text>
              {tab === 'pending' && pendingCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{pendingCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Time Entries */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.timeEntries}</Text>
            <Text style={styles.entryCount}>{filteredEntries.length} {isNL ? 'items' : 'items'}</Text>
          </View>

          {filteredEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color={COLORS.gray[300]} />
              <Text style={styles.emptyStateText}>
                {isNL ? 'Geen uren gevonden' : 'No entries found'}
              </Text>
            </View>
          ) : (
            filteredEntries.map((entry) => {
              const statusStyle = getStatusStyle(entry.status);
              const canApprove = isManager && entry.status === 'pending' && String(entry.user_id) !== String(user?.id);
              
              return (
                <View key={entry.id} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <View style={styles.entryDate}>
                      <Ionicons name="calendar-outline" size={14} color={COLORS.gray[500]} />
                      <Text style={styles.entryDateText}>{formatDate(entry.date)}</Text>
                    </View>
                    <View style={styles.entryBadges}>
                      <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
                        <Ionicons name={statusStyle.icon as any} size={12} color={statusStyle.color} />
                        <Text style={[styles.badgeText, { color: statusStyle.color }]}>
                          {entry.status === 'approved' ? (isNL ? 'Goedgekeurd' : 'Approved') :
                           entry.status === 'rejected' ? (isNL ? 'Afgewezen' : 'Rejected') :
                           (isNL ? 'Wachtend' : 'Pending')}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.entryDescription}>{entry.description}</Text>
                  
                  {entry.user_name && (
                    <View style={styles.entryUser}>
                      <Ionicons name="person-outline" size={14} color={COLORS.gray[400]} />
                      <Text style={styles.entryUserText}>{entry.user_name}</Text>
                    </View>
                  )}

                  {entry.status === 'rejected' && entry.rejection_reason && (
                    <View style={styles.rejectionReason}>
                      <Ionicons name="information-circle" size={14} color="#DC2626" />
                      <Text style={styles.rejectionReasonText}>{entry.rejection_reason}</Text>
                    </View>
                  )}

                  <View style={styles.entryFooter}>
                    <Text style={styles.entryHours}>{formatHours(entry.hours)}</Text>
                    
                    {canApprove && (
                      <View style={styles.approvalActions}>
                        <TouchableOpacity 
                          style={styles.approveBtn}
                          onPress={() => handleApprove(entry.id)}
                        >
                          <Ionicons name="checkmark" size={16} color={COLORS.white} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.rejectBtn}
                          onPress={() => handleReject(entry.id)}
                        >
                          <Ionicons name="close" size={16} color={COLORS.white} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Log Time Button */}
        <TouchableOpacity 
          style={styles.logTimeButton} 
          activeOpacity={0.8}
          onPress={() => navigation.navigate('AddTimeEntry' as never)}
        >
          <LinearGradient
            colors={[COLORS.purple, COLORS.pink]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logTimeButtonGradient}
          >
            <Ionicons name="add-circle" size={20} color={COLORS.white} />
            <Text style={styles.logTimeButtonText}>{t.logTime}</Text>
          </LinearGradient>
        </TouchableOpacity>

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
  addButton: {
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
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  projectName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray[900],
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray[900],
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray[500],
  },
  approvalSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  approvalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  approvalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[700],
  },
  approvalPercentage: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.green,
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
  bulkApproveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.green,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  bulkApproveText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  filterTabs: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 8,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    gap: 4,
  },
  filterTabActive: {
    backgroundColor: COLORS.purple,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray[600],
  },
  filterTabTextActive: {
    color: COLORS.white,
  },
  filterBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  section: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray[900],
  },
  entryCount: {
    fontSize: 14,
    color: COLORS.gray[500],
  },
  emptyState: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.gray[500],
    marginTop: 12,
  },
  entryCard: {
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
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryDateText: {
    fontSize: 13,
    color: COLORS.gray[500],
    marginLeft: 4,
  },
  entryBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  entryDescription: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray[800],
    marginBottom: 8,
    lineHeight: 22,
  },
  entryUser: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  entryUserText: {
    fontSize: 13,
    color: COLORS.gray[500],
  },
  rejectionReason: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 6,
  },
  rejectionReasonText: {
    fontSize: 12,
    color: '#DC2626',
    flex: 1,
    lineHeight: 18,
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryHours: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.purple,
  },
  approvalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  approveBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logTimeButton: {
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logTimeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  logTimeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default TimeTrackingDetailScreen;
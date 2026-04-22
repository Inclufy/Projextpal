import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { projectsService, Project } from '../../services/projects';
import { timeTrackingService, TimeEntry } from '../../services/timeTrackingService';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next'; // ✅ ADD THIS

export const ProjectDetailScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { t, i18n } = useTranslation(); // ✅ ADD THIS
  const { projectId } = route.params;
  const { user } = useAuthStore();
  
  const [project, setProject] = useState<Project | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddHoursModal, setShowAddHoursModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('overview');

  // ✅ Dynamic locale helper
  const getLocale = () => i18n.language === 'nl' ? 'nl-NL' : 'en-US';

  // Check if current user is manager (can approve hours)
  const isManager = user?.role === 'manager' || user?.role === 'admin' || project?.manager_id === user?.id;

  // ✅ Translated activities
  const activities = [
    { 
      id: '1', 
      type: 'task', 
      icon: 'checkmark-circle', 
      color: '#10B981', 
      title: t('projectDetail.activity.taskCompleted'), 
      description: 'Requirements document finalized', 
      time: '2u geleden' 
    },
    { 
      id: '2', 
      type: 'comment', 
      icon: 'chatbubble', 
      color: '#3B82F6', 
      title: t('projectDetail.activity.newComment'), 
      description: 'John commented on design phase', 
      time: '4u geleden' 
    },
    { 
      id: '3', 
      type: 'upload', 
      icon: 'document', 
      color: '#8B5CF6', 
      title: t('projectDetail.activity.documentAdded'), 
      description: 'Project charter uploaded', 
      time: 'Gisteren' 
    },
  ];

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadProject(), loadTimeEntries()]);
    } finally {
      setLoading(false);
    }
  };

  const loadProject = async () => {
    try {
      const data = await projectsService.getProject(projectId);
      setProject(data);
    } catch (error) {
      console.error('Failed to load project:', error);
    }
  };

  const loadTimeEntries = async () => {
    try {
      const data = await timeTrackingService.getTimeEntriesByProject(projectId);
      setTimeEntries(data);
    } catch (error) {
      console.error('Failed to load time entries:', error);
      setTimeEntries([]);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadProject(), loadTimeEntries()]);
    setRefreshing(false);
  }, [projectId]);

  const handleAddHours = async () => {
    if (!hours || parseFloat(hours) <= 0) {
      Alert.alert(t('projectDetail.alerts.error'), t('projectDetail.alerts.invalidHours'));
      return;
    }

    if (!description.trim()) {
      Alert.alert(t('projectDetail.alerts.error'), t('projectDetail.alerts.descriptionRequired'));
      return;
    }

    try {
      setSubmitting(true);
      
      await timeTrackingService.createTimeEntry({
        project_id: projectId,
        hours: parseFloat(hours),
        description: description.trim(),
        date: selectedDate,
        // ✅ Status defaults to 'draft' or 'pending' on backend
      });

      Alert.alert(
        t('projectDetail.alerts.success'), 
        t('projectDetail.alerts.hoursAdded', { hours })
      );
      setShowAddHoursModal(false);
      setHours('');
      setDescription('');
      setSelectedDate(new Date().toISOString().split('T')[0]);
      
      await loadTimeEntries();
      
    } catch (error) {
      console.error('Failed to add hours:', error);
      Alert.alert(t('projectDetail.alerts.error'), t('projectDetail.alerts.couldNotAddHours'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveHours = async (entryId: string) => {
    Alert.alert(
      t('projectDetail.alerts.approveTitle'),
      t('projectDetail.alerts.approveMessage'),
      [
        { text: t('projectDetail.alerts.cancel'), style: 'cancel' },
        {
          text: t('projectDetail.actions.approve'),
          onPress: async () => {
            try {
              await timeTrackingService.updateTimeEntry(entryId, { status: 'approved' });
              Alert.alert(t('projectDetail.alerts.success'), t('projectDetail.alerts.approved'));
              await loadTimeEntries();
            } catch (error) {
              console.error('Failed to approve hours:', error);
              Alert.alert(t('projectDetail.alerts.error'), t('projectDetail.alerts.couldNotApprove'));
            }
          },
        },
      ]
    );
  };

  const handleRejectHours = async (entryId: string) => {
    Alert.prompt(
      t('projectDetail.alerts.rejectTitle'),
      t('projectDetail.alerts.rejectPrompt'),
      [
        { text: t('projectDetail.alerts.cancel'), style: 'cancel' },
        {
          text: t('projectDetail.actions.reject'),
          style: 'destructive',
          onPress: async (reason: string | undefined) => {
            try {
              await timeTrackingService.updateTimeEntry(entryId, {
                status: 'rejected',
                rejection_reason: reason || t('projectDetail.alerts.noReason')
              });
              Alert.alert(t('projectDetail.alerts.rejected'));
              await loadTimeEntries();
            } catch (error) {
              console.error('Failed to reject hours:', error);
              Alert.alert(t('projectDetail.alerts.error'), t('projectDetail.alerts.couldNotReject'));
            }
          },
        },
      ],
      'plain-text',
      ''
    );
  };

  const handleDeleteHours = async (entryId: string) => {
    Alert.alert(
      t('projectDetail.alerts.deleteTitle'),
      t('projectDetail.alerts.deleteMessage'),
      [
        { text: t('projectDetail.alerts.cancel'), style: 'cancel' },
        {
          text: t('projectDetail.actions.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await timeTrackingService.deleteTimeEntry(entryId);
              Alert.alert(t('projectDetail.alerts.deleted'));
              await loadTimeEntries();
            } catch (error) {
              console.error('Failed to delete hours:', error);
              Alert.alert(t('projectDetail.alerts.error'), t('projectDetail.alerts.couldNotDelete'));
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return '#10B981';
      case 'completed': return '#3B82F6';
      case 'on_hold': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    const statusKey = status?.toLowerCase();
    switch (statusKey) {
      case 'active':
        return t('projectDetail.status.active');
      case 'completed':
        return t('projectDetail.status.completed');
      case 'on_hold':
        return t('projectDetail.status.on_hold');
      case 'cancelled':
        return t('projectDetail.status.cancelled');
      default:
        return status;
    }
  };

  const getTimeEntryStatusStyle = (status: string) => {
    switch (status) {
      case 'approved':
        return { 
          bg: '#DCFCE7', 
          text: '#16A34A', 
          label: t('projectDetail.hours.status.approved') 
        };
      case 'rejected':
        return { 
          bg: '#FEE2E2', 
          text: '#DC2626', 
          label: t('projectDetail.hours.status.rejected') 
        };
      case 'draft':
        return { 
          bg: '#F3F4F6', 
          text: '#6B7280', 
          label: t('projectDetail.hours.status.draft') 
        };
      default: // 'pending'
        return { 
          bg: '#FEF3C7', 
          text: '#D97706', 
          label: t('projectDetail.hours.status.pending') 
        };
    }
  };

  // Calculate total hours (including all statuses or just approved/pending?)
  const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0);
  const approvedHours = timeEntries
    .filter(e => e.status === 'approved')
    .reduce((sum, entry) => sum + (entry.hours || 0), 0);
  const pendingHours = timeEntries
    .filter(e => e.status === 'pending' || e.status === 'draft') // ✅ Include draft
    .reduce((sum, entry) => sum + (entry.hours || 0), 0);

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={COLORS.primaryGradient} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('projectDetail.title')}</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={COLORS.primaryGradient} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('projectDetail.title')}</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle" size={64} color="#D1D5DB" />
          <Text style={styles.emptyText}>{t('projectDetail.notFound')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={COLORS.primaryGradient} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{project.name}</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'overview' && styles.tabActive]} 
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
            {t('projectDetail.tabs.overview')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'hours' && styles.tabActive]} 
          onPress={() => setActiveTab('hours')}
        >
          <Text style={[styles.tabText, activeTab === 'hours' && styles.tabTextActive]}>
            {t('projectDetail.tabs.hours')}
          </Text>
          {pendingHours > 0 && isManager && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {timeEntries.filter(e => e.status === 'pending' || e.status === 'draft').length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'activity' && styles.tabActive]} 
          onPress={() => setActiveTab('activity')}
        >
          <Text style={[styles.tabText, activeTab === 'activity' && styles.tabTextActive]}>
            {t('projectDetail.tabs.activity')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8B5CF6']} />
        }
      >
        {activeTab === 'overview' && (
          <>
            {/* Status Card */}
            <View style={styles.statusCard}>
              <View style={styles.statusRow}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(project.status)}</Text>
                </View>
                <Text style={styles.progressPercentage}>{project.progress || 0}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${project.progress || 0}%` }]} />
              </View>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('projectDetail.overview.description')}</Text>
              <Text style={styles.description}>
                {project.description || t('projectDetail.overview.noDescription')}
              </Text>
            </View>

            {/* Info Grid */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('projectDetail.overview.projectInfo')}</Text>
              <View style={styles.infoGrid}>
                {project.start_date && (
                  <View style={styles.infoCard}>
                    <Ionicons name="calendar" size={20} color="#8B5CF6" />
                    <Text style={styles.infoLabel}>{t('projectDetail.overview.startDate')}</Text>
                    <Text style={styles.infoValue}>
                      {new Date(project.start_date).toLocaleDateString(getLocale())}
                    </Text>
                  </View>
                )}
                {project.end_date && (
                  <View style={styles.infoCard}>
                    <Ionicons name="calendar-outline" size={20} color="#EC4899" />
                    <Text style={styles.infoLabel}>{t('projectDetail.overview.endDate')}</Text>
                    <Text style={styles.infoValue}>
                      {new Date(project.end_date).toLocaleDateString(getLocale())}
                    </Text>
                  </View>
                )}
                {project.budget && (
                  <View style={styles.infoCard}>
                    <Ionicons name="wallet" size={20} color="#10B981" />
                    <Text style={styles.infoLabel}>{t('projectDetail.overview.budget')}</Text>
                    <Text style={styles.infoValue}>
                      €{project.budget.toLocaleString(getLocale())}
                    </Text>
                  </View>
                )}
                <View style={styles.infoCard}>
                  <Ionicons name="time" size={20} color="#F59E0B" />
                  <Text style={styles.infoLabel}>{t('projectDetail.overview.totalHours')}</Text>
                  <Text style={styles.infoValue}>{totalHours}u</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {activeTab === 'hours' && (
          <View style={styles.section}>
            {/* Hours Summary */}
            <View style={styles.hoursSummary}>
              <View style={styles.hoursSummaryItem}>
                <Text style={styles.hoursSummaryNumber}>{totalHours}u</Text>
                <Text style={styles.hoursSummaryLabel}>{t('projectDetail.hours.summary.total')}</Text>
              </View>
              <View style={styles.hoursSummaryDivider} />
              <View style={styles.hoursSummaryItem}>
                <Text style={[styles.hoursSummaryNumber, { color: '#16A34A' }]}>{approvedHours}u</Text>
                <Text style={styles.hoursSummaryLabel}>{t('projectDetail.hours.summary.approved')}</Text>
              </View>
              <View style={styles.hoursSummaryDivider} />
              <View style={styles.hoursSummaryItem}>
                <Text style={[styles.hoursSummaryNumber, { color: '#D97706' }]}>{pendingHours}u</Text>
                <Text style={styles.hoursSummaryLabel}>{t('projectDetail.hours.summary.pending')}</Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('projectDetail.hours.registered')}</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => setShowAddHoursModal(true)}>
                <Ionicons name="add-circle" size={28} color="#8B5CF6" />
              </TouchableOpacity>
            </View>
            
            {timeEntries.length === 0 ? (
              <View style={styles.emptyStateCard}>
                <Ionicons name="time-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyStateText}>{t('projectDetail.hours.noHours')}</Text>
                <TouchableOpacity 
                  style={styles.emptyStateButton} 
                  onPress={() => setShowAddHoursModal(true)}
                >
                  <Text style={styles.emptyStateButtonText}>+ {t('projectDetail.hours.addHours')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              timeEntries.map((entry) => {
                const statusStyle = getTimeEntryStatusStyle(entry.status);
                const canEdit = String(entry.user_id) === String(user?.id) && (entry.status === 'pending' || entry.status === 'draft');
                const canApprove = isManager && entry.status === 'pending' && String(entry.user_id) !== String(user?.id);
                
                return (
                  <View key={entry.id} style={styles.timeEntryCard}>
                    <View style={styles.timeEntryHeader}>
                      <View>
                        <Text style={styles.timeEntryUser}>{entry.user_name || entry.user || 'Unknown'}</Text>
                        <Text style={styles.timeEntryDate}>
                          {new Date(entry.date).toLocaleDateString(getLocale(), { 
                            weekday: 'short', 
                            day: 'numeric', 
                            month: 'short' 
                          })}
                        </Text>
                      </View>
                      <View style={styles.timeEntryHours}>
                        <Text style={styles.timeEntryHoursText}>{entry.hours}u</Text>
                      </View>
                    </View>
                    <Text style={styles.timeEntryDescription}>{entry.description}</Text>
                    
                    {entry.status === 'rejected' && entry.rejection_reason && (
                      <View style={styles.rejectionReason}>
                        <Ionicons name="information-circle" size={14} color="#DC2626" />
                        <Text style={styles.rejectionReasonText}>{entry.rejection_reason}</Text>
                      </View>
                    )}
                    
                    <View style={styles.timeEntryFooter}>
                      <View style={[styles.statusChip, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusChipText, { color: statusStyle.text }]}>
                          {statusStyle.label}
                        </Text>
                      </View>
                      
                      <View style={styles.actionButtons}>
                        {canApprove && (
                          <>
                            <TouchableOpacity 
                              style={styles.approveButton} 
                              onPress={() => handleApproveHours(entry.id)}
                            >
                              <Ionicons name="checkmark" size={16} color="white" />
                              <Text style={styles.approveButtonText}>
                                {t('projectDetail.actions.approve')}
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                              style={styles.rejectButton} 
                              onPress={() => handleRejectHours(entry.id)}
                            >
                              <Ionicons name="close" size={16} color="white" />
                            </TouchableOpacity>
                          </>
                        )}
                        {canEdit && (
                          <TouchableOpacity 
                            style={styles.deleteButton} 
                            onPress={() => handleDeleteHours(entry.id)}
                          >
                            <Ionicons name="trash-outline" size={16} color="#DC2626" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {activeTab === 'activity' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('projectDetail.activity.recent')}</Text>
            {activities.map((activity) => (
              <View key={activity.id} style={styles.activityCard}>
                <View style={[styles.activityIcon, { backgroundColor: activity.color + '20' }]}>
                  <Ionicons name={activity.icon as any} size={20} color={activity.color} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityDescription}>{activity.description}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Hours Modal */}
      <Modal visible={showAddHoursModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('projectDetail.modal.addHours')}</Text>
              <TouchableOpacity onPress={() => setShowAddHoursModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.inputLabel}>{t('projectDetail.modal.date')}</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={selectedDate}
              onChangeText={setSelectedDate}
            />
            
            <Text style={styles.inputLabel}>{t('projectDetail.modal.hours')}</Text>
            <TextInput
              style={styles.input}
              placeholder="8.0"
              value={hours}
              onChangeText={setHours}
              keyboardType="decimal-pad"
            />
            
            <Text style={styles.inputLabel}>{t('projectDetail.modal.description')} *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={t('projectDetail.modal.descriptionPlaceholder')}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalNote}>
              <Ionicons name="information-circle" size={16} color="#6B7280" />
              <Text style={styles.modalNoteText}>
                {t('projectDetail.modal.note')}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]} 
              onPress={handleAddHours}
              disabled={submitting}
            >
              <LinearGradient colors={['#8B5CF6', '#EC4899']} style={styles.submitGradient}>
                {submitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>{t('projectDetail.modal.submit')}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  backButton: { padding: 8 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: 'bold', color: 'white', textAlign: 'center', marginHorizontal: 8 },
  moreButton: { padding: 8 },
  
  tabsContainer: { flexDirection: 'row', backgroundColor: 'white', paddingHorizontal: 20, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent', flexDirection: 'row', justifyContent: 'center' },
  tabActive: { borderBottomColor: '#8B5CF6' },
  tabText: { fontSize: 14, fontWeight: '500', color: '#6B7280' },
  tabTextActive: { color: '#8B5CF6', fontWeight: '600' },
  badge: { backgroundColor: '#EF4444', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', marginLeft: 6 },
  badgeText: { color: 'white', fontSize: 11, fontWeight: 'bold' },
  
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#9CA3AF', marginTop: 16 },
  content: { flex: 1, paddingHorizontal: 20 },
  
  statusCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginTop: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  statusText: { fontSize: 14, fontWeight: '600', color: 'white', textTransform: 'capitalize' },
  progressPercentage: { fontSize: 24, fontWeight: 'bold', color: '#1F2937' },
  progressBar: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#8B5CF6' },
  
  section: { marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  addButton: { padding: 4 },
  description: { fontSize: 15, color: '#6B7280', lineHeight: 22 },
  
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  infoCard: { flex: 1, minWidth: '45%', backgroundColor: 'white', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  infoLabel: { fontSize: 12, color: '#6B7280', marginTop: 8, marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: '600', color: '#1F2937' },

  hoursSummary: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  hoursSummaryItem: { flex: 1, alignItems: 'center' },
  hoursSummaryNumber: { fontSize: 24, fontWeight: 'bold', color: '#1F2937' },
  hoursSummaryLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  hoursSummaryDivider: { width: 1, backgroundColor: '#E5E7EB', marginHorizontal: 8 },

  emptyStateCard: { backgroundColor: 'white', borderRadius: 16, padding: 32, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  emptyStateText: { fontSize: 16, color: '#6B7280', marginTop: 16, marginBottom: 16 },
  emptyStateButton: { backgroundColor: '#F5F3FF', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  emptyStateButtonText: { fontSize: 14, fontWeight: '600', color: '#8B5CF6' },
  
  timeEntryCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  timeEntryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  timeEntryUser: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  timeEntryDate: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  timeEntryHours: { backgroundColor: '#F5F3FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  timeEntryHoursText: { fontSize: 16, fontWeight: 'bold', color: '#8B5CF6' },
  timeEntryDescription: { fontSize: 14, color: '#6B7280', marginBottom: 12 },
  timeEntryFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  
  rejectionReason: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEE2E2', padding: 8, borderRadius: 8, marginBottom: 12, gap: 6 },
  rejectionReasonText: { fontSize: 12, color: '#DC2626', flex: 1 },
  
  statusChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusChipText: { fontSize: 12, fontWeight: '600' },
  
  actionButtons: { flexDirection: 'row', gap: 8 },
  approveButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10B981', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 4 },
  approveButtonText: { fontSize: 12, fontWeight: '600', color: 'white' },
  rejectButton: { backgroundColor: '#EF4444', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  deleteButton: { backgroundColor: '#FEE2E2', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  
  activityCard: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  activityIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  activityContent: { flex: 1 },
  activityTitle: { fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  activityDescription: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  activityTime: { fontSize: 12, color: '#9CA3AF' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
  input: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  textArea: { height: 100, textAlignVertical: 'top' },
  modalNote: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', padding: 12, borderRadius: 8, marginBottom: 16, gap: 8 },
  modalNoteText: { fontSize: 13, color: '#6B7280', flex: 1 },
  submitButton: { borderRadius: 12, overflow: 'hidden', marginTop: 8 },
  submitButtonDisabled: { opacity: 0.7 },
  submitGradient: { paddingVertical: 16, alignItems: 'center' },
  submitButtonText: { fontSize: 16, fontWeight: '600', color: 'white' },
});
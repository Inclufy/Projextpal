import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { programsService, Program } from '../../services/programs';
import { projectsService, Project } from '../../services/projects';
import { timeTrackingService, TimeEntry } from '../../services/timeTrackingService';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next'; // ✅ ADD THIS

export const ProgramDetailScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { t, i18n } = useTranslation(); // ✅ ADD THIS
  const { programId } = route.params;
  const { user } = useAuthStore();
  
  const [program, setProgram] = useState<Program | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddHoursModal, setShowAddHoursModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state for hours
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // ✅ Dynamic locale helper
  const getLocale = () => i18n.language === 'nl' ? 'nl-NL' : 'en-US';

  // Check if current user is manager
  const isManager = user?.role === 'manager' || user?.role === 'admin' || program?.manager_id === user?.id;

  useEffect(() => {
    loadData();
  }, [programId]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadProgram(),
        loadProjects(),
        loadTimeEntries(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadProgram = async () => {
    try {
      const data = await programsService.getProgram(programId);
      setProgram(data);
    } catch (error) {
      console.error('Failed to load program:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const data = await projectsService.getProjectsByProgram(programId);
      setProjects(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
      setProjects([]);
    }
  };

  const loadTimeEntries = async () => {
    try {
      const data = await timeTrackingService.getTimeEntriesByProgram(programId);
      setTimeEntries(data);
    } catch (error) {
      console.error('Failed to load time entries:', error);
      setTimeEntries([]);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadProgram(), loadProjects(), loadTimeEntries()]);
    setRefreshing(false);
  }, [programId]);

  const handleAddHours = async () => {
    if (!hours || parseFloat(hours) <= 0) {
      Alert.alert(t('common.error'), t('projectDetail.alerts.invalidHours'));
      return;
    }
    if (!description.trim()) {
      Alert.alert(t('common.error'), t('projectDetail.alerts.descriptionRequired'));
      return;
    }

    try {
      setSubmitting(true);
      await timeTrackingService.createTimeEntry({
        program_id: programId,
        hours: parseFloat(hours),
        description: description.trim(),
        date: selectedDate,
        status: 'pending',
      });

      Alert.alert(
        t('common.success'), 
        t('projectDetail.alerts.hoursAdded', { hours })
      );
      setShowAddHoursModal(false);
      setHours('');
      setDescription('');
      setSelectedDate(new Date().toISOString().split('T')[0]);
      await loadTimeEntries();
    } catch (error) {
      console.error('Failed to add hours:', error);
      Alert.alert(t('common.error'), t('projectDetail.alerts.couldNotAddHours'));
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
              Alert.alert(t('common.success'), t('projectDetail.alerts.approved'));
              await loadTimeEntries();
            } catch (error) {
              Alert.alert(t('common.error'), t('projectDetail.alerts.couldNotApprove'));
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
          onPress: async (reason) => {
            try {
              await timeTrackingService.updateTimeEntry(entryId, { 
                status: 'rejected',
                rejection_reason: reason || t('projectDetail.alerts.noReason')
              });
              Alert.alert(t('projectDetail.alerts.rejected'));
              await loadTimeEntries();
            } catch (error) {
              Alert.alert(t('common.error'), t('projectDetail.alerts.couldNotReject'));
            }
          },
        },
      ],
      'plain-text',
      ''
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
        return t('programs.status.active');
      case 'completed':
        return t('programs.status.completed');
      case 'on_hold':
        return t('programs.status.on_hold');
      case 'planning':
        return t('programs.status.planning');
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
      default:
        return { 
          bg: '#FEF3C7', 
          text: '#D97706', 
          label: t('projectDetail.hours.status.pending') 
        };
    }
  };

  // Calculate totals
  const totalHours = timeEntries.reduce((sum, e) => sum + (e.hours || 0), 0);
  const approvedHours = timeEntries.filter(e => e.status === 'approved').reduce((sum, e) => sum + (e.hours || 0), 0);
  const pendingHours = timeEntries.filter(e => e.status === 'pending' || e.status === 'draft').reduce((sum, e) => sum + (e.hours || 0), 0);
  const pendingCount = timeEntries.filter(e => e.status === 'pending' || e.status === 'draft').length;

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#3B82F6', '#8B5CF6']} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('programs.detail.title')}</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </View>
    );
  }

  if (!program) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#3B82F6', '#8B5CF6']} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('programs.detail.title')}</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle" size={64} color="#D1D5DB" />
          <Text style={styles.emptyText}>{t('programs.detail.notFound')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#3B82F6', '#8B5CF6']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{program.name}</Text>
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
            {t('programs.detail.tabs.overview')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'projects' && styles.tabActive]} 
          onPress={() => setActiveTab('projects')}
        >
          <Text style={[styles.tabText, activeTab === 'projects' && styles.tabTextActive]}>
            {t('programs.detail.tabs.projects')}
          </Text>
          {projects.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{projects.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'hours' && styles.tabActive]} 
          onPress={() => setActiveTab('hours')}
        >
          <Text style={[styles.tabText, activeTab === 'hours' && styles.tabTextActive]}>
            {t('programs.detail.tabs.hours')}
          </Text>
          {pendingCount > 0 && isManager && (
            <View style={[styles.tabBadge, { backgroundColor: '#EF4444' }]}>
              <Text style={styles.tabBadgeText}>{pendingCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />
        }
      >
        {activeTab === 'overview' && (
          <>
            {/* Stats Card */}
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <Ionicons name="folder" size={32} color="#3B82F6" />
                <Text style={styles.statNumber}>{projects.length}</Text>
                <Text style={styles.statLabel}>{t('programs.detail.stats.projects')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="trending-up" size={32} color="#10B981" />
                <Text style={styles.statNumber}>{program.progress || 0}%</Text>
                <Text style={styles.statLabel}>{t('programs.detail.stats.progress')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="time" size={32} color="#F59E0B" />
                <Text style={styles.statNumber}>{totalHours}u</Text>
                <Text style={styles.statLabel}>{t('programs.detail.stats.hours')}</Text>
              </View>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('programs.detail.description')}</Text>
              <Text style={styles.description}>
                {program.description || t('programs.detail.noDescription')}
              </Text>
            </View>

            {/* Status & Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('programs.detail.information')}</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoCard}>
                  <Ionicons name="flag" size={20} color="#3B82F6" />
                  <Text style={styles.infoLabel}>{t('programs.detail.statusLabel')}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(program.status) }]}>
                    <Text style={styles.statusBadgeText}>{getStatusText(program.status)}</Text>
                  </View>
                </View>
                {program.start_date && (
                  <View style={styles.infoCard}>
                    <Ionicons name="calendar" size={20} color="#8B5CF6" />
                    <Text style={styles.infoLabel}>{t('programs.detail.startDate')}</Text>
                    <Text style={styles.infoValue}>
                      {new Date(program.start_date).toLocaleDateString(getLocale())}
                    </Text>
                  </View>
                )}
                {program.budget && (
                  <View style={styles.infoCard}>
                    <Ionicons name="wallet" size={20} color="#10B981" />
                    <Text style={styles.infoLabel}>{t('programs.detail.budget')}</Text>
                    <Text style={styles.infoValue}>
                      €{program.budget.toLocaleString(getLocale())}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('programs.detail.actions')}</Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => navigation.navigate('AddProject', { programId })}
                >
                  <Ionicons name="add-circle" size={20} color="#3B82F6" />
                  <Text style={styles.actionButtonText}>{t('programs.detail.addProject')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => setActiveTab('hours')}
                >
                  <Ionicons name="time" size={20} color="#3B82F6" />
                  <Text style={styles.actionButtonText}>{t('programs.detail.logHours')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {activeTab === 'projects' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {t('programs.detail.projectsList')} ({projects.length})
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('AddProject', { programId })}>
                <Ionicons name="add-circle" size={24} color="#3B82F6" />
              </TouchableOpacity>
            </View>

            {projects.length === 0 ? (
              <View style={styles.emptyStateCard}>
                <Ionicons name="folder-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyStateText}>{t('programs.detail.noProjects')}</Text>
                <TouchableOpacity 
                  style={styles.emptyStateButton}
                  onPress={() => navigation.navigate('AddProject', { programId })}
                >
                  <Text style={styles.emptyStateButtonText}>
                    + {t('programs.detail.addProject')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              projects.map((project) => (
                <TouchableOpacity 
                  key={project.id} 
                  style={styles.projectCard}
                  onPress={() => navigation.navigate('ProjectDetail', { projectId: project.id })}
                >
                  <View style={styles.projectHeader}>
                    <View style={styles.projectIcon}>
                      <Ionicons name="folder" size={20} color="#8B5CF6" />
                    </View>
                    <View style={styles.projectInfo}>
                      <Text style={styles.projectName}>{project.name}</Text>
                      <Text style={styles.projectDesc} numberOfLines={1}>
                        {project.description}
                      </Text>
                    </View>
                    <View style={[styles.projectStatus, { backgroundColor: getStatusColor(project.status) }]}>
                      <Text style={styles.projectStatusText}>{getStatusText(project.status)}</Text>
                    </View>
                  </View>
                  <View style={styles.projectProgress}>
                    <View style={styles.progressBarSmall}>
                      <View style={[styles.progressFillSmall, { width: `${project.progress || 0}%` }]} />
                    </View>
                    <Text style={styles.progressTextSmall}>{project.progress || 0}%</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
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
              <TouchableOpacity onPress={() => setShowAddHoursModal(true)}>
                <Ionicons name="add-circle" size={28} color="#3B82F6" />
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
                  <Text style={styles.emptyStateButtonText}>
                    + {t('projectDetail.hours.addHours')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              timeEntries.map((entry) => {
                const statusStyle = getTimeEntryStatusStyle(entry.status);
                const canApprove = isManager && entry.status === 'pending' && entry.user_id !== user?.id;
                
                return (
                  <View key={entry.id} style={styles.timeEntryCard}>
                    <View style={styles.timeEntryHeader}>
                      <View>
                        <Text style={styles.timeEntryUser}>{entry.user_name || 'Unknown'}</Text>
                        <Text style={styles.timeEntryDate}>
                          {new Date(entry.date).toLocaleDateString(getLocale(), { 
                            weekday: 'short', day: 'numeric', month: 'short' 
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
                      
                      {canApprove && (
                        <View style={styles.approvalActions}>
                          <TouchableOpacity 
                            style={styles.approveButton} 
                            onPress={() => handleApproveHours(entry.id)}
                          >
                            <Ionicons name="checkmark" size={16} color="white" />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.rejectButton} 
                            onPress={() => handleRejectHours(entry.id)}
                          >
                            <Ionicons name="close" size={16} color="white" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Hours Modal */}
      <Modal visible={showAddHoursModal} animationType="slide" transparent>
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
              <LinearGradient colors={['#3B82F6', '#8B5CF6']} style={styles.submitGradient}>
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
  tabActive: { borderBottomColor: '#3B82F6' },
  tabText: { fontSize: 14, fontWeight: '500', color: '#6B7280' },
  tabTextActive: { color: '#3B82F6', fontWeight: '600' },
  tabBadge: { backgroundColor: '#3B82F6', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', marginLeft: 6 },
  tabBadgeText: { color: 'white', fontSize: 11, fontWeight: 'bold' },
  
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#9CA3AF', marginTop: 16 },
  content: { flex: 1, paddingHorizontal: 20 },
  
  statsCard: { backgroundColor: 'white', borderRadius: 16, padding: 24, marginTop: 20, flexDirection: 'row', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: '#E5E7EB', marginHorizontal: 8 },
  statNumber: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginTop: 8 },
  statLabel: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  
  section: { marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 12 },
  description: { fontSize: 15, color: '#6B7280', lineHeight: 22 },
  
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  infoCard: { flex: 1, minWidth: '30%', backgroundColor: 'white', borderRadius: 12, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  infoLabel: { fontSize: 12, color: '#6B7280', marginTop: 8, marginBottom: 4 },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusBadgeText: { fontSize: 12, fontWeight: '600', color: 'white', textTransform: 'capitalize' },
  
  actionButtons: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1, backgroundColor: 'white', borderRadius: 12, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  actionButtonText: { fontSize: 14, fontWeight: '500', color: '#1F2937', marginTop: 8, textAlign: 'center' },
  
  // Projects tab
  projectCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  projectHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  projectIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F5F3FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  projectInfo: { flex: 1 },
  projectName: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  projectDesc: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  projectStatus: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  projectStatusText: { fontSize: 11, fontWeight: '600', color: 'white', textTransform: 'capitalize' },
  projectProgress: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressBarSmall: { flex: 1, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, overflow: 'hidden' },
  progressFillSmall: { height: '100%', backgroundColor: '#8B5CF6' },
  progressTextSmall: { fontSize: 12, fontWeight: '600', color: '#1F2937', width: 35 },
  
  // Hours tab
  hoursSummary: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  hoursSummaryItem: { flex: 1, alignItems: 'center' },
  hoursSummaryNumber: { fontSize: 24, fontWeight: 'bold', color: '#1F2937' },
  hoursSummaryLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  hoursSummaryDivider: { width: 1, backgroundColor: '#E5E7EB', marginHorizontal: 8 },
  
  emptyStateCard: { backgroundColor: 'white', borderRadius: 16, padding: 32, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  emptyStateText: { fontSize: 16, color: '#6B7280', marginTop: 16, marginBottom: 16 },
  emptyStateButton: { backgroundColor: '#EFF6FF', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  emptyStateButtonText: { fontSize: 14, fontWeight: '600', color: '#3B82F6' },
  
  timeEntryCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  timeEntryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  timeEntryUser: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  timeEntryDate: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  timeEntryHours: { backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  timeEntryHoursText: { fontSize: 16, fontWeight: 'bold', color: '#3B82F6' },
  timeEntryDescription: { fontSize: 14, color: '#6B7280', marginBottom: 12 },
  timeEntryFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  
  rejectionReason: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEE2E2', padding: 8, borderRadius: 8, marginBottom: 12, gap: 6 },
  rejectionReasonText: { fontSize: 12, color: '#DC2626', flex: 1 },
  
  statusChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusChipText: { fontSize: 12, fontWeight: '600' },
  
  approvalActions: { flexDirection: 'row', gap: 8 },
  approveButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center' },
  rejectButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center' },
  
  // Modal
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
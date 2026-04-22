import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { timeTrackingService, TimeEntry } from '../../services/timeTrackingService';
import { projectsService, Project } from '../../services/projects';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next'; // ✅ ADD THIS

export const TimeTrackingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { t } = useTranslation(); // ✅ ADD THIS
  
  const [isTracking, setIsTracking] = useState(false);
  const [currentTask, setCurrentTask] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  useEffect(() => {
    loadData();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [entriesData, projectsData] = await Promise.all([
        timeTrackingService.getCurrentWeekEntries(),
        projectsService.getProjects(),
      ]);
      setTimeEntries(entriesData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const toggleTracking = () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  const startTracking = () => {
    if (!selectedProjectId) {
      Alert.alert(
        t('timeTracking.selectProjectTitle'), 
        t('timeTracking.selectProjectMessage')
      );
      return;
    }
    
    setIsTracking(true);
    startTimeRef.current = new Date();
    
    timerRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const now = new Date();
        const diff = Math.floor((now.getTime() - startTimeRef.current.getTime()) / 1000);
        setElapsedTime(diff);
      }
    }, 1000);
  };

  const stopTracking = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setIsTracking(false);
    
    const hours = Math.round((elapsedTime / 3600) * 100) / 100;
    
    if (hours < 0.01) {
      Alert.alert(t('timeTracking.tooShort'), t('timeTracking.tooShortMessage'));
      setElapsedTime(0);
      return;
    }

    if (!currentTask.trim()) {
      Alert.alert(
        t('timeTracking.descriptionNeeded'), 
        t('timeTracking.descriptionNeededMessage')
      );
      return;
    }

    try {
      setSubmitting(true);
      
      await timeTrackingService.createTimeEntry({
        project_id: selectedProjectId!,
        hours: hours,
        description: currentTask.trim(),
        date: new Date().toISOString().split('T')[0],
      });

      Alert.alert(
        t('common.success'), 
        t('timeTracking.hoursRegistered', { hours: timeTrackingService.formatHours(hours) })
      );
      
      setElapsedTime(0);
      setCurrentTask('');
      startTimeRef.current = null;
      
      await loadData();
      
    } catch (error) {
      console.error('Failed to save time entry:', error);
      Alert.alert(t('common.error'), t('timeTracking.errorSaving'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualEntry = async () => {
    navigation.navigate('AddTimeEntry', {
      onSave: () => loadData(),
    });
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const today = new Date().toISOString().split('T')[0];
  const todayEntries = timeEntries.filter(e => e.date === today);
  const todayHours = todayEntries.reduce((sum, e) => sum + (e.hours || 0), 0);
  const todayTasks = todayEntries.length;
  const todayProjects = new Set(todayEntries.map(e => e.project_id)).size;

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved':
        return { bg: '#DCFCE7', icon: 'checkmark-circle', color: '#16A34A' };
      case 'rejected':
        return { bg: '#FEE2E2', icon: 'close-circle', color: '#DC2626' };
      default:
        return { bg: '#FEF3C7', icon: 'time', color: '#D97706' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return t('timeTracking.statusApproved');
      case 'rejected':
        return t('timeTracking.statusRejected');
      default:
        return t('timeTracking.statusPending');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#F59E0B', '#EF4444']} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>{t('timeTracking.title')}</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F59E0B" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#F59E0B', '#EF4444']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('timeTracking.title')}</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleManualEntry}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F59E0B']} />
        }
      >
        {/* Active Tracker */}
        <View style={styles.trackerCard}>
          <Text style={styles.trackerTitle}>
            {isTracking ? t('timeTracking.timerActive') : t('timeTracking.startTimer')}
          </Text>
          <Text style={styles.timerDisplay}>{formatTime(elapsedTime)}</Text>
          
          {/* Project Selector */}
          <TouchableOpacity 
            style={styles.projectSelector}
            onPress={() => setShowProjectPicker(!showProjectPicker)}
            disabled={isTracking}
          >
            <Ionicons name="folder" size={20} color="#8B5CF6" />
            <Text style={[styles.projectSelectorText, !selectedProject && styles.placeholderText]}>
              {selectedProject?.name || t('timeTracking.selectProject')}
            </Text>
            <Ionicons name={showProjectPicker ? 'chevron-up' : 'chevron-down'} size={20} color="#6B7280" />
          </TouchableOpacity>

          {/* Project Picker Dropdown */}
          {showProjectPicker && (
            <View style={styles.projectDropdown}>
              <ScrollView style={styles.projectList} nestedScrollEnabled>
                {projects.map((project) => (
                  <TouchableOpacity
                    key={project.id}
                    style={[
                      styles.projectOption,
                      selectedProjectId === project.id && styles.projectOptionSelected
                    ]}
                    onPress={() => {
                      setSelectedProjectId(project.id);
                      setShowProjectPicker(false);
                    }}
                  >
                    <Text style={[
                      styles.projectOptionText,
                      selectedProjectId === project.id && styles.projectOptionTextSelected
                    ]}>
                      {project.name}
                    </Text>
                    {selectedProjectId === project.id && (
                      <Ionicons name="checkmark" size={20} color="#8B5CF6" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          
          <TextInput
            style={styles.taskInput}
            placeholder={t('timeTracking.whatAreYouDoing')}
            value={currentTask}
            onChangeText={setCurrentTask}
            placeholderTextColor="#9CA3AF"
            editable={!submitting}
          />

          <TouchableOpacity
            style={[styles.trackButton, submitting && styles.trackButtonDisabled]}
            onPress={toggleTracking}
            disabled={submitting}
          >
            <LinearGradient
              colors={isTracking ? ['#EF4444', '#DC2626'] : ['#10B981', '#059669']}
              style={styles.trackButtonGradient}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name={isTracking ? 'stop' : 'play'} size={24} color="white" />
                  <Text style={styles.trackButtonText}>
                    {isTracking ? t('timeTracking.stopAndSave') : t('timeTracking.start')}
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Today's Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{t('timeTracking.today')}</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Ionicons name="time" size={24} color="#F59E0B" />
              <Text style={styles.summaryValue}>{formatDuration(todayHours)}</Text>
              <Text style={styles.summaryLabel}>{t('timeTracking.worked')}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.summaryValue}>{todayTasks}</Text>
              <Text style={styles.summaryLabel}>{t('timeTracking.tasks')}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="folder" size={24} color="#8B5CF6" />
              <Text style={styles.summaryValue}>{todayProjects}</Text>
              <Text style={styles.summaryLabel}>{t('timeTracking.projects')}</Text>
            </View>
          </View>
        </View>

        {/* Recent Entries */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('timeTracking.thisWeek')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('TimeTrackingHistory')}>
              <Text style={styles.seeAllText}>{t('timeTracking.seeAll')} →</Text>
            </TouchableOpacity>
          </View>
          
          {timeEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>{t('timeTracking.noHoursThisWeek')}</Text>
            </View>
          ) : (
            timeEntries.slice(0, 10).map((entry) => {
              const statusStyle = getStatusStyle(entry.status);
              const project = projects.find(p => p.id === entry.project_id);
              
              return (
                <TouchableOpacity 
                  key={entry.id} 
                  style={styles.entryCard}
                  onPress={() => navigation.navigate('TimeTrackingDetail', { entryId: entry.id })}
                >
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryProject} numberOfLines={1}>
                      {project?.name || entry.project_id}
                    </Text>
                    <Text style={styles.entryDuration}>{formatDuration(entry.hours)}</Text>
                  </View>
                  <Text style={styles.entryTask} numberOfLines={2}>{entry.description}</Text>
                  <View style={styles.entryFooter}>
                    <Text style={styles.entryDate}>
                      {new Date(entry.date).toLocaleDateString('nl-NL', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short'
                      })}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                      <Ionicons name={statusStyle.icon as any} size={12} color={statusStyle.color} />
                      <Text style={[styles.statusText, { color: statusStyle.color }]}>
                        {getStatusText(entry.status)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  backButton: { padding: 8 },
  title: { flex: 1, fontSize: 24, fontWeight: 'bold', color: 'white', textAlign: 'center' },
  addButton: { padding: 8 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, paddingHorizontal: 20 },
  
  trackerCard: { backgroundColor: 'white', borderRadius: 20, padding: 24, marginTop: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  trackerTitle: { fontSize: 16, color: '#6B7280', marginBottom: 12, textAlign: 'center' },
  timerDisplay: { fontSize: 48, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 20, fontVariant: ['tabular-nums'] },
  
  projectSelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB', gap: 12 },
  projectSelectorText: { flex: 1, fontSize: 16, color: '#1F2937' },
  placeholderText: { color: '#9CA3AF' },
  
  projectDropdown: { backgroundColor: 'white', borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB', maxHeight: 200, overflow: 'hidden' },
  projectList: { maxHeight: 200 },
  projectOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  projectOptionSelected: { backgroundColor: '#F5F3FF' },
  projectOptionText: { fontSize: 15, color: '#1F2937' },
  projectOptionTextSelected: { color: '#8B5CF6', fontWeight: '600' },
  
  taskInput: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16, fontSize: 16, color: '#1F2937', marginBottom: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  trackButton: { borderRadius: 12, overflow: 'hidden' },
  trackButtonDisabled: { opacity: 0.7 },
  trackButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  trackButtonText: { fontSize: 18, fontWeight: '600', color: 'white' },
  
  summaryCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginTop: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  summaryTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center' },
  summaryValue: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginTop: 8 },
  summaryLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  
  section: { marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  seeAllText: { fontSize: 14, color: '#F59E0B', fontWeight: '600' },
  
  emptyState: { backgroundColor: 'white', borderRadius: 16, padding: 32, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  emptyStateText: { fontSize: 14, color: '#6B7280', marginTop: 12 },
  
  entryCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  entryProject: { fontSize: 16, fontWeight: '600', color: '#1F2937', flex: 1, marginRight: 8 },
  entryDuration: { fontSize: 16, fontWeight: 'bold', color: '#F59E0B' },
  entryTask: { fontSize: 14, color: '#6B7280', marginBottom: 8, lineHeight: 20 },
  entryFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  entryDate: { fontSize: 12, color: '#9CA3AF' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  statusText: { fontSize: 11, fontWeight: '600' },
});
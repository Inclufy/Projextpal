import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { projectsService, Project } from '../../services/projects';
import { useTranslation } from 'react-i18next';

export const ProjectsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  // ✅ Dynamic locale helper
  const getLocale = () => i18n.language === 'nl' ? 'nl-NL' : 'en-US';

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsService.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  }, []);

  const getFilteredProjects = () => {
    switch (filter) {
      case 'active':
        return projects.filter(p => p.status === 'active' || p.status === 'in_progress');
      case 'completed':
        return projects.filter(p => p.status === 'completed');
      default:
        return projects;
    }
  };

  const filteredProjects = getFilteredProjects();
  const activeCount = projects.filter(p => p.status === 'active' || p.status === 'in_progress').length;
  const completedCount = projects.filter(p => p.status === 'completed').length;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'in_progress':
        return '#10B981';
      case 'completed':
        return '#3B82F6';
      case 'on_hold':
        return '#F59E0B';
      case 'cancelled':
        return '#EF4444';
      case 'planning':
      case 'pending':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    const statusKey = status?.toLowerCase();
    switch (statusKey) {
      case 'planning':
        return t('projects.status.planning');
      case 'pending':
        return t('projects.status.pending');
      case 'active':
        return t('projects.status.active');
      case 'in_progress':
        return t('projects.status.in_progress');
      case 'completed':
        return t('projects.status.completed');
      case 'on_hold':
        return t('projects.status.on_hold');
      case 'cancelled':
        return t('projects.status.cancelled');
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={COLORS.primaryGradient} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>{t('projects.title')}</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddProject')}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
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
        <Text style={styles.title}>{t('projects.title')}</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddProject')}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{projects.length}</Text>
          <Text style={styles.statLabel}>{t('projects.total')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#10B981' }]}>{activeCount}</Text>
          <Text style={styles.statLabel}>{t('projects.active')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#3B82F6' }]}>{completedCount}</Text>
          <Text style={styles.statLabel}>{t('projects.completed')}</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            {t('projects.all')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'active' && styles.filterTabActive]}
          onPress={() => setFilter('active')}
        >
          <Text style={[styles.filterText, filter === 'active' && styles.filterTextActive]}>
            {t('projects.active')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'completed' && styles.filterTabActive]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>
            {t('projects.completed')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Projects List */}
      <ScrollView
        style={styles.projectsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8B5CF6']} />
        }
      >
        {filteredProjects.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>{t('projects.noProjects')}</Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => navigation.navigate('AddProject')}
            >
              <Text style={styles.emptyStateButtonText}>{t('projects.addProject')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredProjects.map((project) => (
            <TouchableOpacity
              key={project.id}
              style={styles.projectCard}
              onPress={() => navigation.navigate('ProjectDetail', { projectId: project.id })}
            >
              <View style={styles.projectHeader}>
                <View style={styles.projectIcon}>
                  <Ionicons name="folder" size={24} color="#8B5CF6" />
                </View>
                <View style={styles.projectInfo}>
                  <Text style={styles.projectName} numberOfLines={1}>
                    {project.name}
                  </Text>
                  <Text style={styles.projectDescription} numberOfLines={2}>
                    {project.description || t('projects.noDescription')}
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>{t('projects.progress')}</Text>
                  <Text style={styles.progressValue}>{project.progress || 0}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[styles.progressFill, { width: `${project.progress || 0}%` }]}
                  />
                </View>
              </View>

              {/* Project Footer */}
              <View style={styles.projectFooter}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(project.status)}</Text>
                </View>
                {project.budget && (
                  <View style={styles.budgetInfo}>
                    <Ionicons name="wallet-outline" size={16} color="#6B7280" />
                    <Text style={styles.budgetText}>
                      €{project.budget.toLocaleString(getLocale())}
                    </Text>
                  </View>
                )}
              </View>

              {/* Dates */}
              {(project.start_date || project.end_date) && (
                <View style={styles.datesContainer}>
                  {project.start_date && (
                    <View style={styles.dateItem}>
                      <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
                      <Text style={styles.dateText}>
                        {new Date(project.start_date).toLocaleDateString(getLocale())}
                      </Text>
                    </View>
                  )}
                  {project.end_date && (
                    <>
                      <Text style={styles.dateSeparator}>→</Text>
                      <View style={styles.dateItem}>
                        <Ionicons name="calendar" size={14} color="#9CA3AF" />
                        <Text style={styles.dateText}>
                          {new Date(project.end_date).toLocaleDateString(getLocale())}
                        </Text>
                      </View>
                    </>
                  )}
                </View>
              )}
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: { padding: 8 },
  title: { flex: 1, fontSize: 24, fontWeight: 'bold', color: 'white', textAlign: 'center' },
  addButton: { padding: 8 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: { fontSize: 28, fontWeight: 'bold', color: '#1F2937' },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },

  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#8B5CF6',
  },
  filterText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  filterTextActive: { color: 'white' },

  projectsList: { flex: 1, paddingHorizontal: 20 },

  emptyState: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyStateText: { fontSize: 16, color: '#6B7280', marginTop: 16, textAlign: 'center' },
  emptyStateButton: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  emptyStateButtonText: { fontSize: 14, fontWeight: '600', color: '#8B5CF6' },

  projectCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectHeader: { flexDirection: 'row', marginBottom: 16 },
  projectIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  projectInfo: { flex: 1 },
  projectName: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  projectDescription: { fontSize: 14, color: '#6B7280', lineHeight: 20 },

  progressSection: { marginBottom: 12 },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: { fontSize: 12, color: '#6B7280' },
  progressValue: { fontSize: 12, fontWeight: '600', color: '#1F2937' },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#8B5CF6', borderRadius: 4 },

  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: { fontSize: 12, fontWeight: '600', color: 'white' },
  budgetInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  budgetText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },

  datesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  dateItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 12, color: '#9CA3AF' },
  dateSeparator: { fontSize: 12, color: '#D1D5DB', marginHorizontal: 8 },
});
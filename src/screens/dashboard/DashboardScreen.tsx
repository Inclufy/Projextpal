import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { COLORS } from '../../constants/colors';
import { MenuModal } from '../../components/MenuModal';
import { useLanguage } from '../../contexts/LanguageContext';
import { projectsService } from '../../services/projectsService';
import { coursesService } from '../../services/coursesService';
import { timeTrackingService } from '../../services/timeTrackingService';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 80) / 4;

interface DashboardStats {
  courses_enrolled: number;
  certificates: number;
  study_hours: number;
  progress: number;
  projects_active: number;
  hours_this_week: number;
  pending_approvals: number;
  risks_open: number;
}

interface RecentProject {
  id: string;
  name: string;
  progress: number;
  status: string;
}

interface RecentCourse {
  id: string;
  title: string;
  progress: number;
  duration: string;
  icon: string;
  gradient: string[];
}

export const DashboardScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { t, isNL } = useLanguage();
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [stats, setStats] = useState<DashboardStats>({
    courses_enrolled: 0,
    certificates: 0,
    study_hours: 0,
    progress: 0,
    projects_active: 0,
    hours_this_week: 0,
    pending_approvals: 0,
    risks_open: 0,
  });
  
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [recentCourses, setRecentCourses] = useState<RecentCourse[]>([]);

  const quickActions = [
    { name: isNL ? 'Projecten' : 'Projects', icon: 'folder', screen: 'Projects', colors: ['#8B5CF6', '#EC4899'] },
    { name: isNL ? "Programma's" : 'Programs', icon: 'briefcase', screen: 'Programs', colors: ['#3B82F6', '#8B5CF6'] },
    { name: 'Time', icon: 'time', screen: 'TimeTracking', colors: ['#F59E0B', '#EF4444'] },
    { name: 'Budget', icon: 'wallet', screen: 'Budget', colors: ['#10B981', '#3B82F6'] },
    { name: isNL ? "Risico's" : 'Risks', icon: 'shield', screen: 'Risks', colors: ['#EC4899', '#8B5CF6'] },
    { name: 'Academy', icon: 'school', screen: 'Academy', colors: ['#F59E0B', '#EC4899'] },
    { name: 'Team', icon: 'people', screen: 'Team', colors: ['#6366F1', '#8B5CF6'], soon: true },
    { name: 'Docs', icon: 'document-text', screen: 'Documents', colors: ['#14B8A6', '#06B6D4'], soon: true },
    { name: 'Analytics', icon: 'analytics', screen: 'Analytics', colors: ['#F97316', '#FB923C'], soon: true },
    { name: isNL ? 'Kalender' : 'Calendar', icon: 'calendar', screen: 'Calendar', colors: ['#A855F7', '#C084FC'], soon: true },
    { name: isNL ? 'Taken' : 'Tasks', icon: 'checkmark-circle', screen: 'Tasks', colors: ['#2563EB', '#3B82F6'], soon: true },
    { name: isNL ? 'Instellingen' : 'Settings', icon: 'settings', screen: 'Settings', colors: ['#6B7280', '#9CA3AF'], soon: true },
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load data in parallel
      const [projects, courses, weekEntries] = await Promise.all([
        projectsService.getProjects().catch(() => []),
        coursesService.getEnrolledCourses().catch(() => []),
        timeTrackingService.getCurrentWeekEntries().catch(() => []),
      ]);

      // Calculate stats
      const activeProjects = projects;
      const weekHours = weekEntries.reduce((sum: number, e: any) => sum + (e.hours || 0), 0);
      const pendingHours = weekEntries.filter((e: any) => e.status === 'pending').length;
      
      // Calculate course progress
      const totalProgress = courses.reduce((sum: number, c: any) => sum + (c.progress || 0), 0);
      const avgProgress = courses.length > 0 ? Math.round(totalProgress / courses.length) : 0;

      setStats({
        courses_enrolled: courses.length,
        certificates: courses.filter((c: any) => c.completed).length,
        study_hours: Math.round(weekHours),
        progress: avgProgress,
        projects_active: activeProjects.length,
        hours_this_week: Math.round(weekHours * 10) / 10,
        pending_approvals: pendingHours,
        risks_open: 0, // Would need risksService
      });

      // Set recent projects
      setRecentProjects(
        projects.slice(0, 3).map((p: any) => ({
          id: p.id,
          name: p.name,
          progress: p.progress || 0,
          status: p.status,
        }))
      );

      // Set recent courses with gradients
      const courseGradients = [
        ['#8B5CF6', '#A855F7'],
        ['#3B82F6', '#2563EB'],
        ['#10B981', '#059669'],
        ['#F59E0B', '#D97706'],
      ];
      
      setRecentCourses(
        courses.slice(0, 4).map((c: any, index: number) => ({
          id: c.id,
          title: c.title,
          progress: c.progress || 0,
          duration: c.duration || '0u',
          icon: c.methodology === 'PRINCE2' ? 'shield-checkmark' : 
                c.methodology === 'Agile' ? 'flash' : 
                c.methodology === 'Scrum' ? 'sync' : 'bar-chart',
          gradient: courseGradients[index % courseGradients.length],
        }))
      );

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return isNL ? 'Goedemorgen' : 'Good morning';
    if (hour < 18) return isNL ? 'Goedemiddag' : 'Good afternoon';
    return isNL ? 'Goedenavond' : 'Good evening';
  };

  const getUserDisplayName = () => {
    if (user?.firstName) return user.firstName;
    if (user?.email) return user.email.split('@')[0];
    return isNL ? 'daar' : 'there';
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={COLORS.primaryGradient} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
            <Ionicons name="menu" size={28} color="white" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{getUserDisplayName()}! 👋</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('AIChat')} style={styles.aiButton}>
            <Ionicons name="sparkles" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8B5CF6']} />
        }
      >
        {/* AI Command Card */}
        <TouchableOpacity style={styles.aiCommandCard} onPress={() => navigation.navigate('AIChat')}>
          <LinearGradient colors={['#6366F1', '#8B5CF6', '#A855F7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.aiCommandGradient}>
            <View style={styles.aiCommandContent}>
              <View style={styles.aiCommandIcon}>
                <Ionicons name="sparkles" size={24} color="white" />
              </View>
              <View style={styles.aiCommandText}>
                <Text style={styles.aiCommandTitle}>AI Assistent</Text>
                <Text style={styles.aiCommandSubtitle}>
                  {isNL ? 'Vraag me alles over je projecten...' : 'Ask me anything about your projects...'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="white" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Stats Cards */}
        {loading ? (
          <View style={styles.statsLoading}>
            <ActivityIndicator color="#8B5CF6" />
          </View>
        ) : (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <LinearGradient colors={['#8B5CF6', '#A855F7']} style={styles.statIconGradient}>
                  <Ionicons name="folder-open-outline" size={28} color="white" />
                </LinearGradient>
                <Text style={styles.statNumber}>{stats.projects_active}</Text>
                <Text style={styles.statLabel}>{isNL ? 'Projecten' : 'Projects'}</Text>
              </View>
              <View style={styles.statCard}>
                <LinearGradient colors={['#EC4899', '#F472B6']} style={styles.statIconGradient}>
                  <Ionicons name="school-outline" size={28} color="white" />
                </LinearGradient>
                <Text style={styles.statNumber}>{stats.courses_enrolled}</Text>
                <Text style={styles.statLabel}>{isNL ? 'Cursussen' : 'Courses'}</Text>
              </View>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.statIconGradient}>
                  <Ionicons name="time-outline" size={28} color="white" />
                </LinearGradient>
                <Text style={styles.statNumber}>{stats.hours_this_week}u</Text>
                <Text style={styles.statLabel}>{isNL ? 'Deze week' : 'This week'}</Text>
              </View>
              <View style={styles.statCard}>
                <LinearGradient colors={['#10B981', '#059669']} style={styles.statIconGradient}>
                  <Ionicons name="trophy-outline" size={28} color="white" />
                </LinearGradient>
                <Text style={styles.statNumber}>{stats.certificates}</Text>
                <Text style={styles.statLabel}>{isNL ? 'Certificaten' : 'Certificates'}</Text>
              </View>
            </View>
          </>
        )}

        {/* Pending Approvals Alert */}
        {stats.pending_approvals > 0 && (
          <TouchableOpacity 
            style={styles.alertCard} 
            onPress={() => navigation.navigate('TimeTrackingDetail')}
          >
            <View style={styles.alertIcon}>
              <Ionicons name="alert-circle" size={24} color="#F59E0B" />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>
                {isNL ? 'Uren wachten op goedkeuring' : 'Hours pending approval'}
              </Text>
              <Text style={styles.alertSubtitle}>
                {stats.pending_approvals} {isNL ? 'uren te beoordelen' : 'entries to review'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{isNL ? 'Snelle acties' : 'Quick actions'}</Text>
          </View>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <View key={index} style={styles.actionButtonWrapper}>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={() => !action.soon && navigation.navigate(action.screen)} 
                  disabled={action.soon}
                >
                  <LinearGradient 
                    colors={action.colors} 
                    style={[styles.actionGradient, action.soon && styles.actionDisabled]}
                  >
                    <Ionicons name={action.icon as any} size={24} color="white" />
                  </LinearGradient>
                  <Text style={[styles.actionLabel, action.soon && styles.actionLabelDisabled]} numberOfLines={1}>
                    {action.name}
                  </Text>
                  {action.soon && (
                    <View style={styles.comingSoonBadge}>
                      <Text style={styles.comingSoonText}>Soon</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Projects */}
        {recentProjects.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{isNL ? 'Recente Projecten' : 'Recent Projects'}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Projects')}>
                <Text style={styles.seeAll}>{isNL ? 'Alles →' : 'View all →'}</Text>
              </TouchableOpacity>
            </View>
            {recentProjects.map((project) => (
              <TouchableOpacity 
                key={project.id} 
                style={styles.projectCard}
                onPress={() => navigation.navigate('ProjectDetail', { projectId: project.id })}
              >
                <View style={styles.projectInfo}>
                  <Text style={styles.projectName}>{project.name}</Text>
                  <View style={styles.projectMeta}>
                    <View style={[styles.statusDot, { backgroundColor: project.status === 'active' ? '#10B981' : '#F59E0B' }]} />
                    <Text style={styles.projectStatus}>
                      {project.status === 'active' ? (isNL ? 'Actief' : 'Active') : project.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.projectProgress}>
                  <Text style={styles.projectProgressText}>{project.progress}%</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${project.progress}%` }]} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Trainingen */}
        {recentCourses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🎓 {isNL ? 'Trainingen' : 'Courses'}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Academy')}>
                <Text style={styles.seeAll}>{isNL ? 'Alles →' : 'View all →'}</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trainingsScroll}>
              {recentCourses.map((course) => (
                <TouchableOpacity 
                  key={course.id} 
                  style={styles.luxeTrainingCard} 
                  onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
                >
                  <LinearGradient 
                    colors={course.gradient} 
                    start={{ x: 0, y: 0 }} 
                    end={{ x: 1, y: 1 }} 
                    style={styles.luxeTrainingHeader}
                  >
                    <View style={styles.luxeIconContainer}>
                      <Ionicons name={course.icon as any} size={32} color="white" />
                    </View>
                    {course.progress === 0 && (
                      <View style={styles.freeBadgeLuxe}>
                        <Text style={styles.freeBadgeTextLuxe}>{isNL ? 'GRATIS' : 'FREE'}</Text>
                      </View>
                    )}
                    {course.progress > 0 && (
                      <View style={[styles.freeBadgeLuxe, { backgroundColor: 'rgba(16,185,129,0.9)' }]}>
                        <Text style={styles.freeBadgeTextLuxe}>{course.progress}%</Text>
                      </View>
                    )}
                  </LinearGradient>
                  <View style={styles.luxeTrainingContent}>
                    <Text style={styles.luxeTrainingTitle} numberOfLines={2}>{course.title}</Text>
                    <View style={styles.luxeTrainingMeta}>
                      <Ionicons name="time-outline" size={14} color="#6B7280" />
                      <Text style={styles.luxeTrainingDuration}>{course.duration}</Text>
                    </View>
                    <TouchableOpacity style={styles.luxeStartButton}>
                      <Text style={styles.luxeStartButtonText}>
                        {course.progress > 0 ? (isNL ? 'Doorgaan →' : 'Continue →') : (isNL ? 'Start cursus →' : 'Start course →')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <MenuModal visible={menuVisible} onClose={() => setMenuVisible(false)} navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 24, paddingHorizontal: 20 },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  menuButton: { padding: 4, marginRight: 12 },
  headerText: { flex: 1 },
  greeting: { fontSize: 16, color: 'white', opacity: 0.9 },
  userName: { fontSize: 24, fontWeight: 'bold', color: 'white', marginTop: 4 },
  aiButton: { padding: 4, marginLeft: 8 },
  content: { flex: 1, paddingHorizontal: 24 },
  
  aiCommandCard: { marginTop: 20, borderRadius: 20, overflow: 'hidden', shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  aiCommandGradient: { padding: 20 },
  aiCommandContent: { flexDirection: 'row', alignItems: 'center' },
  aiCommandIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  aiCommandText: { flex: 1 },
  aiCommandTitle: { fontSize: 18, fontWeight: 'bold', color: 'white', marginBottom: 4 },
  aiCommandSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)' },
  
  statsLoading: { padding: 40, alignItems: 'center' },
  statsContainer: { flexDirection: 'row', marginTop: 20, gap: 16 },
  statCard: { flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  statIconGradient: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  statNumber: { fontSize: 28, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  statLabel: { fontSize: 14, color: '#6b7280' },
  
  alertCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', borderRadius: 12, padding: 16, marginTop: 16, borderWidth: 1, borderColor: '#FDE68A' },
  alertIcon: { marginRight: 12 },
  alertContent: { flex: 1 },
  alertTitle: { fontSize: 14, fontWeight: '600', color: '#92400E' },
  alertSubtitle: { fontSize: 12, color: '#B45309', marginTop: 2 },
  
  section: { marginTop: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  seeAll: { fontSize: 14, color: '#8B5CF6', fontWeight: '600' },
  
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  actionButtonWrapper: { width: '25%', paddingHorizontal: 6, marginBottom: 16 },
  actionButton: { alignItems: 'center', position: 'relative' },
  actionGradient: { width: ITEM_WIDTH - 12, height: ITEM_WIDTH - 12, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  actionDisabled: { opacity: 0.5 },
  actionLabel: { fontSize: 11, color: '#1f2937', textAlign: 'center', fontWeight: '500' },
  actionLabelDisabled: { color: '#9CA3AF' },
  comingSoonBadge: { position: 'absolute', top: -4, right: 0, backgroundColor: '#F59E0B', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  comingSoonText: { fontSize: 9, fontWeight: 'bold', color: 'white' },
  
  projectCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  projectInfo: { flex: 1, marginRight: 16 },
  projectName: { fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  projectMeta: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  projectStatus: { fontSize: 12, color: '#6B7280' },
  projectProgress: { alignItems: 'flex-end', width: 60 },
  projectProgressText: { fontSize: 14, fontWeight: '600', color: '#8B5CF6', marginBottom: 4 },
  progressBar: { width: '100%', height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#8B5CF6', borderRadius: 2 },
  
  trainingsScroll: { gap: 16 },
  luxeTrainingCard: { width: 200, backgroundColor: 'white', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 },
  luxeTrainingHeader: { height: 120, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  luxeIconContainer: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  freeBadgeLuxe: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  freeBadgeTextLuxe: { fontSize: 10, fontWeight: 'bold', color: '#16A34A' },
  luxeTrainingContent: { padding: 16 },
  luxeTrainingTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 8, lineHeight: 22 },
  luxeTrainingMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  luxeTrainingDuration: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  luxeStartButton: { backgroundColor: '#F9FAFB', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  luxeStartButtonText: { fontSize: 13, fontWeight: '600', color: '#8B5CF6' },
});

export default DashboardScreen;
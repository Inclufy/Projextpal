import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

interface DashboardData {
  projects_count: number;
  active_courses: number;
  completed_courses: number;
  recent_projects: Array<{ id: number; name: string; methodology: string; status: string }>;
}

export default function DashboardScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function loadDashboard() {
    try {
      const res = await api.get('/dashboard/');
      setData(res.data);
    } catch {
      // use defaults
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#A78BFA" />}
    >
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeText}>
          {t('dashboard.welcome')}, {user?.first_name || 'User'}
        </Text>
        <Text style={styles.welcomeSub}>
          {user?.organization || 'ProjeXtPal'}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="folder-open" size={24} color="#818CF8" />
          <Text style={styles.statNumber}>{data?.projects_count ?? 0}</Text>
          <Text style={styles.statLabel}>{t('projects.myProjects')}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="school" size={24} color="#34D399" />
          <Text style={styles.statNumber}>{data?.active_courses ?? 0}</Text>
          <Text style={styles.statLabel}>{t('academy.courses')}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color="#FBBF24" />
          <Text style={styles.statNumber}>{data?.completed_courses ?? 0}</Text>
          <Text style={styles.statLabel}>{t('academy.completed')}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>{t('dashboard.quickActions')}</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('ProjectsTab')}
        >
          <Ionicons name="add-circle" size={32} color="#818CF8" />
          <Text style={styles.actionText}>{t('projects.myProjects')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('AcademyTab')}
        >
          <Ionicons name="book" size={32} color="#34D399" />
          <Text style={styles.actionText}>{t('academy.courses')}</Text>
        </TouchableOpacity>
      </View>

      {data?.recent_projects && data.recent_projects.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>{t('dashboard.recentProjects')}</Text>
          {data.recent_projects.map((project) => (
            <TouchableOpacity
              key={project.id}
              style={styles.projectCard}
              onPress={() => navigation.navigate('ProjectsTab', {
                screen: 'ProjectDetail',
                params: { projectId: project.id },
              })}
            >
              <View>
                <Text style={styles.projectName}>{project.name}</Text>
                <Text style={styles.projectMeta}>
                  {project.methodology} · {project.status}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          ))}
        </>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191A2E',
  },
  welcomeCard: {
    backgroundColor: '#1F2037',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#7C3AED',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F3F4F6',
  },
  welcomeSub: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1F2037',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F3F4F6',
  },
  statLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F3F4F6',
    marginTop: 24,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 8,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#1F2037',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 13,
    color: '#D1D5DB',
    fontWeight: '600',
  },
  projectCard: {
    backgroundColor: '#1F2037',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F3F4F6',
  },
  projectMeta: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
});

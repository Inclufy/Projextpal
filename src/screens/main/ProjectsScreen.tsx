import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

interface Project {
  id: number;
  name: string;
  methodology: string;
  status: string;
  progress: number;
  team_count: number;
}

export default function ProjectsScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadProjects() {
    try {
      const res = await api.get('/projects/');
      setProjects(res.data.results || res.data || []);
    } catch {
      // keep empty
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  }

  const methodologyColor: Record<string, string> = {
    scrum: '#818CF8',
    kanban: '#34D399',
    prince2: '#F472B6',
    waterfall: '#60A5FA',
    agile: '#FBBF24',
    lean_six_sigma: '#F97316',
  };

  function renderProject({ item }: { item: Project }) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ProjectDetail', { projectId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.methodBadge,
              { backgroundColor: (methodologyColor[item.methodology] || '#818CF8') + '20' },
            ]}
          >
            <Text
              style={[
                styles.methodText,
                { color: methodologyColor[item.methodology] || '#818CF8' },
              ]}
            >
              {item.methodology?.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          <Text style={styles.status}>{item.status}</Text>
        </View>
        <Text style={styles.projectName}>{item.name}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${item.progress || 0}%` }]} />
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <Ionicons name="people" size={14} color="#9CA3AF" />
            <Text style={styles.footerText}>{item.team_count || 0} members</Text>
          </View>
          <Text style={styles.progressText}>{item.progress || 0}%</Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={projects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#A78BFA" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={64} color="#374151" />
            <Text style={styles.emptyText}>No projects yet</Text>
            <Text style={styles.emptySubtext}>Create your first project on the web app</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191A2E',
  },
  center: {
    flex: 1,
    backgroundColor: '#191A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#1F2037',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  methodBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  methodText: {
    fontSize: 11,
    fontWeight: '700',
  },
  status: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'capitalize',
  },
  projectName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F3F4F6',
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  progressText: {
    fontSize: 12,
    color: '#A78BFA',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#4B5563',
  },
});

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

interface ProjectDetail {
  id: number;
  name: string;
  description: string;
  methodology: string;
  status: string;
  progress: number;
  start_date: string;
  end_date: string;
  team_members: Array<{ id: number; name: string; role: string }>;
}

export default function ProjectDetailScreen({ route }: any) {
  const { projectId } = route.params;
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/projects/${projectId}/`);
        setProject(res.data);
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Project not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{project.name}</Text>
        <View style={styles.badges}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {project.methodology?.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          <View style={[styles.badge, styles.statusBadge]}>
            <Text style={styles.statusText}>{project.status}</Text>
          </View>
        </View>
      </View>

      {project.description ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{project.description}</Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Progress</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${project.progress || 0}%` }]} />
        </View>
        <Text style={styles.progressText}>{project.progress || 0}% complete</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Timeline</Text>
        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={16} color="#9CA3AF" />
          <Text style={styles.infoText}>
            {project.start_date || 'TBD'} - {project.end_date || 'TBD'}
          </Text>
        </View>
      </View>

      {project.team_members && project.team_members.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Team ({project.team_members.length})
          </Text>
          {project.team_members.map((member) => (
            <View key={member.id} style={styles.memberRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {member.name?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
              <View>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRole}>{member.role}</Text>
              </View>
            </View>
          ))}
        </View>
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
  center: {
    flex: 1,
    backgroundColor: '#191A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2037',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F3F4F6',
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  badge: {
    backgroundColor: '#818CF820',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#818CF8',
  },
  statusBadge: {
    backgroundColor: '#34D39920',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34D399',
    textTransform: 'capitalize',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2037',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D1D5DB',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 22,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    color: '#A78BFA',
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F3F4F6',
  },
  memberRole: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

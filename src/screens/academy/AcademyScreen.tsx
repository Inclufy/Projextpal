import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

interface Course {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  modules_count: number;
  lessons_count: number;
  duration_hours: number;
  level: string;
  thumbnail?: string;
  enrolled?: boolean;
  progress?: number;
}

export default function AcademyScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadCourses() {
    try {
      const res = await api.get('/academy/courses/');
      setCourses(res.data.results || res.data || []);
    } catch {
      // keep empty
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await loadCourses();
    setRefreshing(false);
  }

  const levelColors: Record<string, string> = {
    beginner: '#34D399',
    intermediate: '#FBBF24',
    advanced: '#F472B6',
  };

  function renderCourse({ item }: { item: Course }) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('CourseDetail', { courseId: item.id, slug: item.slug })}
      >
        <View style={styles.cardTop}>
          <View
            style={[
              styles.levelBadge,
              { backgroundColor: (levelColors[item.level] || '#818CF8') + '20' },
            ]}
          >
            <Text
              style={[
                styles.levelText,
                { color: levelColors[item.level] || '#818CF8' },
              ]}
            >
              {item.level?.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.category}>{item.category}</Text>
        </View>

        <Text style={styles.courseTitle}>{item.title}</Text>
        <Text style={styles.courseDesc} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Ionicons name="layers" size={14} color="#9CA3AF" />
            <Text style={styles.metaText}>{item.modules_count} modules</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="document-text" size={14} color="#9CA3AF" />
            <Text style={styles.metaText}>{item.lessons_count} lessons</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time" size={14} color="#9CA3AF" />
            <Text style={styles.metaText}>{item.duration_hours}h</Text>
          </View>
        </View>

        {item.enrolled && (
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${item.progress || 0}%` }]} />
            </View>
            <Text style={styles.progressText}>{item.progress || 0}%</Text>
          </View>
        )}
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
        data={courses}
        renderItem={renderCourse}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#A78BFA" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="school-outline" size={64} color="#374151" />
            <Text style={styles.emptyText}>No courses available</Text>
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
  },
  card: {
    backgroundColor: '#1F2037',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '700',
  },
  category: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  courseTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F3F4F6',
    marginBottom: 6,
  },
  courseDesc: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 12,
  },
  meta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34D399',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#34D399',
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
});

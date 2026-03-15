import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

interface Lesson {
  id: number;
  title: string;
  duration_minutes: number;
  order: number;
  completed?: boolean;
}

interface Module {
  id: number;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface CourseDetail {
  id: number;
  slug: string;
  title: string;
  description: string;
  modules: Module[];
  enrolled: boolean;
  progress: number;
}

export default function CourseDetailScreen({ route, navigation }: any) {
  const { courseId, slug } = route.params;
  const { t } = useTranslation();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function load() {
      try {
        const endpoint = slug
          ? `/academy/courses/${slug}/`
          : `/academy/courses/${courseId}/`;
        const res = await api.get(endpoint);
        setCourse(res.data);
        if (res.data.modules?.length > 0) {
          setExpandedModules(new Set([res.data.modules[0].id]));
        }
      } catch {
        // handle
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId, slug]);

  function toggleModule(moduleId: number) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  }

  function openLesson(lesson: Lesson, moduleId: number) {
    navigation.navigate('LessonPlayer', {
      courseId: course?.id,
      courseSlug: course?.slug,
      moduleId,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
    });
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Course not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{course.title}</Text>
        <Text style={styles.description}>{course.description}</Text>
        {course.enrolled && (
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${course.progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{course.progress}% complete</Text>
          </View>
        )}
      </View>

      <Text style={styles.sectionTitle}>
        {t('academy.modules')} ({course.modules?.length || 0})
      </Text>

      {course.modules?.map((mod) => (
        <View key={mod.id} style={styles.moduleCard}>
          <TouchableOpacity
            style={styles.moduleHeader}
            onPress={() => toggleModule(mod.id)}
          >
            <View style={styles.moduleInfo}>
              <Text style={styles.moduleOrder}>Module {mod.order}</Text>
              <Text style={styles.moduleTitle}>{mod.title}</Text>
              <Text style={styles.lessonCount}>
                {mod.lessons?.length || 0} {t('academy.lessons').toLowerCase()}
              </Text>
            </View>
            <Ionicons
              name={expandedModules.has(mod.id) ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>

          {expandedModules.has(mod.id) && (
            <View style={styles.lessonsList}>
              {mod.lessons?.map((lesson) => (
                <TouchableOpacity
                  key={lesson.id}
                  style={styles.lessonRow}
                  onPress={() => openLesson(lesson, mod.id)}
                >
                  <View style={styles.lessonLeft}>
                    <Ionicons
                      name={lesson.completed ? 'checkmark-circle' : 'play-circle'}
                      size={20}
                      color={lesson.completed ? '#34D399' : '#818CF8'}
                    />
                    <Text
                      style={[
                        styles.lessonTitle,
                        lesson.completed && styles.lessonCompleted,
                      ]}
                    >
                      {lesson.title}
                    </Text>
                  </View>
                  <Text style={styles.lessonDuration}>
                    {lesson.duration_minutes}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ))}

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
  description: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 22,
    marginTop: 8,
  },
  progressSection: {
    marginTop: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34D399',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    color: '#34D399',
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F3F4F6',
    padding: 20,
    paddingBottom: 12,
  },
  moduleCard: {
    backgroundColor: '#1F2037',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleOrder: {
    fontSize: 11,
    color: '#818CF8',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  moduleTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F3F4F6',
    marginTop: 2,
  },
  lessonCount: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  lessonsList: {
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  lessonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#292A40',
  },
  lessonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  lessonTitle: {
    fontSize: 14,
    color: '#D1D5DB',
    flex: 1,
  },
  lessonCompleted: {
    color: '#6B7280',
  },
  lessonDuration: {
    fontSize: 12,
    color: '#6B7280',
  },
});

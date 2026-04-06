import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Card } from '../../components';
import { COLORS } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Course } from '../../types';
import { apiService } from '../../services/api';
import { API_CONFIG } from '../../constants/config';

export const CoursesScreen: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await apiService.get<Course[]>(API_CONFIG.ENDPOINTS.COURSES);
      setCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const renderCourse = ({ item }: { item: Course }) => (
    <Card style={styles.courseCard}>
      <View style={styles.courseHeader}>
        <View style={styles.courseBadge}>
          <Text style={styles.courseBadgeText}>{item.methodology}</Text>
        </View>
        {item.bestseller && (
          <View style={[styles.courseBadge, { backgroundColor: COLORS.pink }]}>
            <Text style={styles.courseBadgeText}>Bestseller</Text>
          </View>
        )}
      </View>

      <Text style={styles.courseTitle}>{item.title}</Text>
      <Text style={styles.courseSubtitle} numberOfLines={2}>
        {item.subtitle || item.description}
      </Text>

      <View style={styles.courseDetails}>
        <View style={styles.courseDetailItem}>
          <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.courseDetailText}>{item.duration}</Text>
        </View>
        <View style={styles.courseDetailItem}>
          <Ionicons name="book-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.courseDetailText}>{item.totalLessons} lessen</Text>
        </View>
        <View style={styles.courseDetailItem}>
          <Ionicons name="bar-chart-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.courseDetailText}>{item.difficulty}</Text>
        </View>
      </View>

      <View style={styles.courseFooter}>
        <Text style={styles.coursePrice}>€{item.price}</Text>
        <TouchableOpacity style={styles.enrollButton}>
          <Text style={styles.enrollButtonText}>Start nu</Text>
          <Ionicons name="arrow-forward" size={16} color={COLORS.purple} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cursussen</Text>
        <TouchableOpacity>
          <Ionicons name="search" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={courses}
        renderItem={renderCourse}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadCourses} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={64} color={COLORS.gray[300]} />
            <Text style={styles.emptyText}>Geen cursussen beschikbaar</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  listContent: {
    padding: 16,
  },
  courseCard: {
    marginBottom: 16,
  },
  courseHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  courseBadge: {
    backgroundColor: COLORS.purple,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  courseBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '600',
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  courseSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  courseDetails: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  courseDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  courseDetailText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  coursePrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.purple,
  },
  enrollButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: `${COLORS.purple}15`,
    borderRadius: 8,
  },
  enrollButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.purple,
    marginRight: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
});
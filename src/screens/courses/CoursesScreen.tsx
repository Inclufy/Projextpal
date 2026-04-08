import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { coursesService, Course } from '../../services/coursesService';

export const CoursesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isNL } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadCourses(); }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await coursesService.getCourses();
      setCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCourses();
    setRefreshing(false);
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    return coursesService.getDifficultyColor(difficulty);
  };

  const renderCourse = ({ item }: { item: Course }) => (
    <TouchableOpacity
      style={styles.courseCard}
      onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })}
    >
      <View style={styles.courseHeader}>
        {item.methodology && (
          <View style={[styles.courseBadge, { backgroundColor: COLORS.purple }]}>
            <Text style={styles.courseBadgeText}>{item.methodology}</Text>
          </View>
        )}
        {item.bestseller && (
          <View style={[styles.courseBadge, { backgroundColor: COLORS.pink }]}>
            <Text style={styles.courseBadgeText}>Bestseller</Text>
          </View>
        )}
        {(item.is_free || item.price === 0) && (
          <View style={[styles.courseBadge, { backgroundColor: COLORS.green }]}>
            <Text style={styles.courseBadgeText}>{isNL ? 'GRATIS' : 'FREE'}</Text>
          </View>
        )}
      </View>

      <Text style={styles.courseTitle}>{item.title}</Text>
      <Text style={styles.courseSubtitle} numberOfLines={2}>
        {item.subtitle || item.description}
      </Text>

      <View style={styles.courseDetails}>
        <View style={styles.courseDetailItem}>
          <Ionicons name="time-outline" size={16} color={COLORS.gray[400]} />
          <Text style={styles.courseDetailText}>{item.duration}</Text>
        </View>
        <View style={styles.courseDetailItem}>
          <Ionicons name="book-outline" size={16} color={COLORS.gray[400]} />
          <Text style={styles.courseDetailText}>{item.total_lessons} {isNL ? 'lessen' : 'lessons'}</Text>
        </View>
        {item.difficulty && (
          <View style={styles.courseDetailItem}>
            <View style={[styles.difficultyDot, { backgroundColor: getDifficultyColor(item.difficulty) }]} />
            <Text style={styles.courseDetailText}>{coursesService.getDifficultyLabel(item.difficulty)}</Text>
          </View>
        )}
      </View>

      <View style={styles.courseFooter}>
        <Text style={styles.coursePrice}>{coursesService.formatPrice(item.price)}</Text>
        <View style={styles.enrollButton}>
          <Text style={styles.enrollButtonText}>{isNL ? 'Bekijk cursus' : 'View course'}</Text>
          <Ionicons name="arrow-forward" size={16} color={COLORS.purple} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#F59E0B', '#EC4899']} style={styles.headerGradient}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isNL ? 'Cursussen' : 'Courses'}</Text>
        <View style={styles.headerStats}>
          <Text style={styles.statsText}>{courses.length}</Text>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.purple} />
        </View>
      ) : (
        <FlatList
          data={courses}
          renderItem={renderCourse}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.purple]} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={64} color={COLORS.gray[300]} />
              <Text style={styles.emptyText}>{isNL ? 'Geen cursussen beschikbaar' : 'No courses available'}</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  headerGradient: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: 16 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: 'white', flex: 1 },
  headerStats: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statsText: { color: 'white', fontSize: 13, fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16 },
  courseCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  courseHeader: { flexDirection: 'row', marginBottom: 12, flexWrap: 'wrap', gap: 6 },
  courseBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  courseBadgeText: { color: 'white', fontSize: 10, fontWeight: '600' },
  courseTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 6 },
  courseSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 16, lineHeight: 20 },
  courseDetails: { flexDirection: 'row', marginBottom: 16, flexWrap: 'wrap', gap: 12 },
  courseDetailItem: { flexDirection: 'row', alignItems: 'center' },
  courseDetailText: { fontSize: 12, color: '#6B7280', marginLeft: 4 },
  difficultyDot: { width: 8, height: 8, borderRadius: 4, marginRight: 2 },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  coursePrice: { fontSize: 20, fontWeight: 'bold', color: COLORS.purple },
  enrollButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, backgroundColor: `${COLORS.purple}10`, borderRadius: 8 },
  enrollButtonText: { fontSize: 13, fontWeight: '600', color: COLORS.purple, marginRight: 4 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 64 },
  emptyText: { fontSize: 16, color: '#9CA3AF', marginTop: 16 },
});

export default CoursesScreen;

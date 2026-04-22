import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useLanguage } from '../../contexts/LanguageContext';
import { COLORS } from '../../constants/colors';
import { coursesService, Course, Lesson, Enrollment } from '../../services/coursesService';

type CourseDetailRouteParams = {
  CourseDetail: { courseId: string };
};

export const CourseDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<CourseDetailRouteParams, 'CourseDetail'>>();
  const { t, isNL } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, [route.params?.courseId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const courseId = route.params?.courseId;
      
      if (!courseId) {
        Alert.alert(t.error, isNL ? 'Geen cursus ID opgegeven' : 'No course ID provided');
        navigation.goBack();
        return;
      }

      const [courseData, lessonsData, enrollmentData] = await Promise.all([
        coursesService.getCourse(courseId),
        coursesService.getCourseLessons(courseId),
        coursesService.getEnrollment(courseId),
      ]);

      setCourse(courseData);
      setLessons(lessonsData);
      setEnrollment(enrollmentData);
      
      if (enrollmentData?.completed_lessons) {
        setCompletedLessons(new Set(enrollmentData.completed_lessons));
      }
    } catch (error) {
      console.error('Failed to load course:', error);
      Alert.alert(t.error, isNL ? 'Kon cursus niet laden' : 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [route.params?.courseId]);

  const handleEnroll = async () => {
    if (!course) return;
    
    try {
      setEnrolling(true);
      const newEnrollment = await coursesService.enrollInCourse(course.id);
      setEnrollment(newEnrollment);
      Alert.alert(
        isNL ? 'Ingeschreven!' : 'Enrolled!',
        isNL ? `Je bent ingeschreven voor ${course.title}` : `You're enrolled in ${course.title}`
      );
    } catch (error) {
      console.error('Enrollment failed:', error);
      Alert.alert(t.error, isNL ? 'Inschrijving mislukt' : 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const handleLessonPress = async (lesson: Lesson) => {
    if (lesson.locked && !enrollment) {
      Alert.alert(
        isNL ? 'Inschrijving vereist' : 'Enrollment Required',
        isNL ? 'Schrijf je eerst in om deze les te bekijken' : 'Please enroll first to access this lesson',
        [
          { text: isNL ? 'Annuleren' : 'Cancel', style: 'cancel' },
          { text: isNL ? 'Inschrijven' : 'Enroll', onPress: handleEnroll },
        ]
      );
      return;
    }

    // Navigate to lesson
    (navigation as any).navigate('LessonDetail', {
      courseId: course?.id,
      lessonId: lesson.id
    });
  };

  const handleCompleteLesson = async (lessonId: string) => {
    if (!course) return;
    
    try {
      await coursesService.completeLesson(course.id, lessonId);
      setCompletedLessons(prev => new Set([...prev, lessonId]));
      
      // Refresh enrollment data to get updated progress
      const updatedEnrollment = await coursesService.getEnrollment(course.id);
      setEnrollment(updatedEnrollment);
    } catch (error) {
      console.error('Failed to complete lesson:', error);
    }
  };

  const handleContinueCourse = async () => {
    if (!course) return;
    
    try {
      const nextLesson = await coursesService.getNextLesson(course.id);
      if (nextLesson) {
        (navigation as any).navigate('LessonDetail', {
          courseId: course.id,
          lessonId: nextLesson.id,
        });
      } else {
        // All lessons completed
        Alert.alert(
          isNL ? 'Gefeliciteerd!' : 'Congratulations!',
          isNL ? 'Je hebt alle lessen voltooid!' : 'You\'ve completed all lessons!'
        );
      }
    } catch (error) {
      // Fallback: start from first incomplete lesson
      const firstIncomplete = lessons.find(l => !completedLessons.has(l.id));
      if (firstIncomplete) {
        (navigation as any).navigate('LessonDetail', {
          courseId: course.id,
          lessonId: firstIncomplete.id,
        });
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.purple} />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color={COLORS.red} />
        <Text style={styles.errorText}>{t.error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>{isNL ? 'Terug' : 'Go Back'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isEnrolled = !!enrollment;
  const progress = enrollment?.progress || 0;
  const completedCount = completedLessons.size;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.purple, COLORS.pink]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.courseDetails}</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.purple]} />
        }
      >
        {/* Course Info Card */}
        <View style={styles.courseCard}>
          {/* Badges */}
          <View style={styles.badgesRow}>
            {course.methodology && (
              <View style={[styles.badge, { backgroundColor: COLORS.purple }]}>
                <Text style={styles.badgeText}>{course.methodology}</Text>
              </View>
            )}
            {course.bestseller && (
              <View style={[styles.badge, { backgroundColor: COLORS.pink }]}>
                <Text style={styles.badgeText}>Bestseller</Text>
              </View>
            )}
            {(course.is_free || course.price === 0) && (
              <View style={[styles.badge, { backgroundColor: COLORS.green }]}>
                <Text style={styles.badgeText}>{isNL ? 'GRATIS' : 'FREE'}</Text>
              </View>
            )}
          </View>

          <Text style={styles.courseTitle}>{course.title}</Text>
          <Text style={styles.courseDescription}>{course.description}</Text>

          {/* Instructor */}
          {course.instructor_name && (
            <View style={styles.instructorRow}>
              <View style={styles.instructorAvatar}>
                <Ionicons name="person" size={20} color={COLORS.purple} />
              </View>
              <View>
                <Text style={styles.instructorLabel}>{isNL ? 'Instructeur' : 'Instructor'}</Text>
                <Text style={styles.instructorName}>{course.instructor_name}</Text>
              </View>
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={18} color={COLORS.gray[500]} />
              <Text style={styles.statText}>{course.duration}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="play-circle-outline" size={18} color={COLORS.gray[500]} />
              <Text style={styles.statText}>{course.total_lessons || lessons.length} {t.lessons?.toLowerCase() || 'lessons'}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="star" size={18} color={COLORS.orange} />
              <Text style={styles.statText}>{course.rating?.toFixed(1) || 'N/A'}</Text>
            </View>
            {course.enrolled_count && (
              <>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Ionicons name="people-outline" size={18} color={COLORS.gray[500]} />
                  <Text style={styles.statText}>{course.enrolled_count.toLocaleString()}</Text>
                </View>
              </>
            )}
          </View>

          {/* Progress (if enrolled) */}
          {isEnrolled && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>{t.progress}</Text>
                <Text style={styles.progressValue}>{progress}%</Text>
              </View>
              <View style={styles.progressBarBackground}>
                <LinearGradient
                  colors={[COLORS.purple, COLORS.pink]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressBarFill, { width: `${progress}%` }]}
                />
              </View>
              <Text style={styles.progressSubtext}>
                {completedCount}/{lessons.length} {isNL ? 'lessen voltooid' : 'lessons completed'}
              </Text>
            </View>
          )}
        </View>

        {/* Skills */}
        {course.skills && course.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {isNL ? 'Wat je leert' : 'What you\'ll learn'}
            </Text>
            <View style={styles.skillsContainer}>
              {course.skills.map((skill, index) => (
                <View key={index} style={styles.skillBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={COLORS.green} />
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Lessons List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.lessons || 'Lessen'}</Text>
            <Text style={styles.lessonCount}>
              {lessons.length} {isNL ? 'lessen' : 'lessons'}
            </Text>
          </View>
          
          {lessons.length === 0 ? (
            <View style={styles.emptyLessons}>
              <Ionicons name="book-outline" size={48} color={COLORS.gray[300]} />
              <Text style={styles.emptyLessonsText}>
                {isNL ? 'Geen lessen beschikbaar' : 'No lessons available'}
              </Text>
            </View>
          ) : (
            lessons.map((lesson, index) => {
              const isCompleted = completedLessons.has(lesson.id);
              const isLocked = !isEnrolled && index > 0; // First lesson always available
              
              return (
                <TouchableOpacity
                  key={lesson.id}
                  style={[
                    styles.lessonItem,
                    isCompleted && styles.lessonCompleted,
                    isLocked && styles.lessonLocked,
                  ]}
                  onPress={() => handleLessonPress({ ...lesson, locked: isLocked })}
                  disabled={isLocked}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.lessonNumber,
                    isCompleted && styles.lessonNumberCompleted,
                  ]}>
                    {isCompleted ? (
                      <Ionicons name="checkmark-circle" size={24} color={COLORS.green} />
                    ) : isLocked ? (
                      <Ionicons name="lock-closed" size={20} color={COLORS.gray[400]} />
                    ) : (
                      <Text style={styles.lessonNumberText}>{index + 1}</Text>
                    )}
                  </View>
                  <View style={styles.lessonInfo}>
                    <Text style={[
                      styles.lessonTitle,
                      isLocked && styles.lessonTitleLocked,
                    ]}>
                      {lesson.title}
                    </Text>
                    <View style={styles.lessonMeta}>
                      <Ionicons name="time-outline" size={12} color={COLORS.gray[400]} />
                      <Text style={styles.lessonDuration}>{lesson.duration}</Text>
                      {lesson.content_type && (
                        <>
                          <View style={styles.metaDot} />
                          <Ionicons 
                            name={
                              lesson.content_type === 'video' ? 'videocam' :
                              lesson.content_type === 'quiz' ? 'help-circle' :
                              lesson.content_type === 'assignment' ? 'document-text' :
                              'document'
                            } 
                            size={12} 
                            color={COLORS.gray[400]} 
                          />
                          <Text style={styles.lessonType}>
                            {lesson.content_type === 'video' ? 'Video' :
                             lesson.content_type === 'quiz' ? 'Quiz' :
                             lesson.content_type === 'assignment' ? (isNL ? 'Opdracht' : 'Assignment') :
                             'Text'}
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                  {!isLocked && (
                    <Ionicons 
                      name={isCompleted ? "checkmark" : "play-circle"} 
                      size={24} 
                      color={isCompleted ? COLORS.green : COLORS.purple} 
                    />
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          style={[styles.actionButton, enrolling && styles.actionButtonDisabled]} 
          activeOpacity={0.8}
          onPress={isEnrolled ? handleContinueCourse : handleEnroll}
          disabled={enrolling}
        >
          <LinearGradient
            colors={[COLORS.purple, COLORS.pink]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.actionButtonGradient}
          >
            {enrolling ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons 
                  name={isEnrolled ? "play" : "bookmark"} 
                  size={20} 
                  color={COLORS.white} 
                />
                <Text style={styles.actionButtonText}>
                  {isEnrolled 
                    ? (progress > 0 ? (t.continueCourse || 'Doorgaan') : (t.startCourse || 'Start Cursus'))
                    : (isNL ? 'Inschrijven' : 'Enroll Now')}
                </Text>
                {!isEnrolled && course.price > 0 && (
                  <Text style={styles.priceText}>€{course.price}</Text>
                )}
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    paddingHorizontal: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray[600],
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.purple,
    borderRadius: 12,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  courseCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '600',
  },
  courseTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.gray[900],
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 14,
    color: COLORS.gray[600],
    lineHeight: 22,
    marginBottom: 16,
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  instructorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.purple}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  instructorLabel: {
    fontSize: 11,
    color: COLORS.gray[500],
    marginBottom: 2,
  },
  instructorName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[700],
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.gray[100],
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  statText: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginLeft: 6,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.gray[200],
  },
  progressSection: {
    marginTop: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[700],
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.purple,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: COLORS.gray[100],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginTop: 8,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray[900],
  },
  lessonCount: {
    fontSize: 14,
    color: COLORS.gray[500],
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.green}10`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skillText: {
    fontSize: 14,
    color: COLORS.green,
    fontWeight: '500',
    marginLeft: 6,
  },
  emptyLessons: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: COLORS.white,
    borderRadius: 16,
  },
  emptyLessonsText: {
    fontSize: 14,
    color: COLORS.gray[500],
    marginTop: 12,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  lessonCompleted: {
    backgroundColor: `${COLORS.green}05`,
  },
  lessonLocked: {
    opacity: 0.6,
  },
  lessonNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  lessonNumberCompleted: {
    backgroundColor: `${COLORS.green}15`,
  },
  lessonNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray[600],
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray[800],
    marginBottom: 4,
  },
  lessonTitleLocked: {
    color: COLORS.gray[500],
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonDuration: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginLeft: 4,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.gray[300],
    marginHorizontal: 8,
  },
  lessonType: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginLeft: 4,
  },
  actionButton: {
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButtonDisabled: {
    opacity: 0.7,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    opacity: 0.9,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default CourseDetailScreen;
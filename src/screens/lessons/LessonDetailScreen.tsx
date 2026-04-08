import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useLanguage } from '../../contexts/LanguageContext';
import { COLORS } from '../../constants/colors';
import { coursesService, Lesson } from '../../services/coursesService';

type LessonDetailRouteParams = {
  LessonDetail: { courseId: string; lessonId: string };
};

export const LessonDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<LessonDetailRouteParams, 'LessonDetail'>>();
  const { isNL } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [completing, setCompleting] = useState(false);

  const courseId = route.params?.courseId;
  const lessonId = route.params?.lessonId;

  useEffect(() => { loadLesson(); }, [courseId, lessonId]);

  const loadLesson = async () => {
    if (!courseId || !lessonId) return;
    try {
      setLoading(true);
      const data = await coursesService.getLesson(courseId, lessonId);
      setLesson(data);
    } catch (error) {
      console.error('Failed to load lesson:', error);
      Alert.alert(
        isNL ? 'Fout' : 'Error',
        isNL ? 'Kon les niet laden' : 'Failed to load lesson'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!courseId || !lessonId) return;
    try {
      setCompleting(true);
      await coursesService.completeLesson(courseId, lessonId);
      Alert.alert(
        isNL ? 'Gefeliciteerd!' : 'Well done!',
        isNL ? 'Les voltooid!' : 'Lesson completed!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Failed to complete lesson:', error);
      Alert.alert(isNL ? 'Fout' : 'Error', isNL ? 'Kon les niet voltooien' : 'Failed to complete lesson');
    } finally {
      setCompleting(false);
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return 'videocam';
      case 'quiz': return 'help-circle';
      case 'assignment': return 'document-text';
      default: return 'document';
    }
  };

  const getContentTypeLabel = (type: string) => {
    if (isNL) {
      switch (type) {
        case 'video': return 'Video les';
        case 'quiz': return 'Quiz';
        case 'assignment': return 'Opdracht';
        default: return 'Tekst les';
      }
    }
    switch (type) {
      case 'video': return 'Video Lesson';
      case 'quiz': return 'Quiz';
      case 'assignment': return 'Assignment';
      default: return 'Text Lesson';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.purple} />
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color={COLORS.red} />
        <Text style={styles.errorText}>{isNL ? 'Les niet gevonden' : 'Lesson not found'}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>{isNL ? 'Terug' : 'Go Back'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.purple, COLORS.pink]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackBtn}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>{lesson.title}</Text>
          <View style={styles.headerMeta}>
            <Ionicons name={getContentTypeIcon(lesson.content_type) as any} size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.headerMetaText}>{getContentTypeLabel(lesson.content_type)}</Text>
            <Text style={styles.headerMetaText}> · {lesson.duration}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Lesson Content Card */}
        <View style={styles.contentCard}>
          <View style={styles.typeHeader}>
            <LinearGradient colors={[COLORS.purple, COLORS.pink]} style={styles.typeIcon}>
              <Ionicons name={getContentTypeIcon(lesson.content_type) as any} size={28} color="white" />
            </LinearGradient>
            <View>
              <Text style={styles.typeLabel}>{getContentTypeLabel(lesson.content_type)}</Text>
              <Text style={styles.typeDuration}>{lesson.duration}</Text>
            </View>
          </View>

          {lesson.description && (
            <Text style={styles.description}>{lesson.description}</Text>
          )}

          {lesson.content_url && (
            <View style={styles.mediaPlaceholder}>
              <Ionicons name="play-circle" size={64} color={COLORS.purple} />
              <Text style={styles.mediaText}>
                {isNL ? 'Tik om af te spelen' : 'Tap to play'}
              </Text>
            </View>
          )}
        </View>

        {/* Complete Button */}
        {!lesson.completed && (
          <TouchableOpacity
            style={[styles.completeButton, completing && { opacity: 0.6 }]}
            onPress={handleComplete}
            disabled={completing}
          >
            <LinearGradient colors={[COLORS.green, '#059669']} style={styles.completeGradient}>
              {completing ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={22} color="white" />
                  <Text style={styles.completeText}>
                    {isNL ? 'Markeer als voltooid' : 'Mark as completed'}
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}

        {lesson.completed && (
          <View style={styles.completedBanner}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.green} />
            <Text style={styles.completedText}>{isNL ? 'Les voltooid!' : 'Lesson completed!'}</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 32 },
  errorText: { marginTop: 16, fontSize: 16, color: COLORS.gray[600], textAlign: 'center' },
  backBtn: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: COLORS.purple, borderRadius: 12 },
  backBtnText: { color: 'white', fontWeight: '600' },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  headerBackBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  headerMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  headerMetaText: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  content: { flex: 1, padding: 16 },
  contentCard: { backgroundColor: 'white', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  typeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  typeIcon: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  typeLabel: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  typeDuration: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  description: { fontSize: 15, color: '#374151', lineHeight: 24, marginBottom: 20 },
  mediaPlaceholder: { backgroundColor: '#F3F4F6', borderRadius: 16, padding: 40, alignItems: 'center', justifyContent: 'center' },
  mediaText: { fontSize: 14, color: '#6B7280', marginTop: 8 },
  completeButton: { marginTop: 20, borderRadius: 16, overflow: 'hidden' },
  completeGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 8 },
  completeText: { fontSize: 16, fontWeight: '700', color: 'white' },
  completedBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ECFDF5', borderRadius: 16, padding: 16, marginTop: 20, gap: 8 },
  completedText: { fontSize: 16, fontWeight: '600', color: '#065F46' },
});

export default LessonDetailScreen;

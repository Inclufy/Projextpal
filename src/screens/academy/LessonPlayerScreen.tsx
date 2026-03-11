/**
 * LessonPlayerScreen - Connected to backend API
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Dimensions, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { COLORS } from '../../constants/colors';
import { coursesService, Lesson, LessonResource } from '../../services/coursesService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_HEIGHT = (SCREEN_WIDTH * 9) / 16;

type TabId = 'content' | 'resources' | 'takeaways';

const TABS: { id: TabId; name: string; icon: string }[] = [
  { id: 'content', name: 'Inhoud', icon: 'document-text' },
  { id: 'resources', name: 'Bronnen', icon: 'folder-open' },
  { id: 'takeaways', name: 'Kernpunten', icon: 'bulb' },
];

export function LessonPlayerScreen({ route, navigation }: any) {
  const { courseId, lessonId } = route.params;
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [resources, setResources] = useState<LessonResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('content');

  const loadLesson = useCallback(async () => {
    try {
      const data = await coursesService.getLesson(courseId, lessonId);
      setLesson(data);
      try {
        const res = await coursesService.getLessonResources(courseId, lessonId);
        setResources(res);
      } catch {
        // resources optional
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }, [courseId, lessonId]);

  useEffect(() => {
    loadLesson();
  }, [loadLesson]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLesson();
    setRefreshing(false);
  }, [loadLesson]);

  async function markComplete() {
    if (!lesson || lesson.completed) return;
    setCompleting(true);
    try {
      await coursesService.completeLesson(courseId, lessonId);
      setLesson((prev) => (prev ? { ...prev, completed: true } : prev));
    } catch {
      // silent
    } finally {
      setCompleting(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.purple} />
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.gray[500]} />
        <Text style={styles.errorText}>Les niet gevonden</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Terug</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Video / Header */}
      {lesson.video_url ? (
        <View style={styles.videoContainer}>
          <WebView
            source={{ uri: lesson.video_url }}
            style={styles.video}
            allowsFullscreenVideo
            javaScriptEnabled
          />
        </View>
      ) : (
        <LinearGradient
          colors={COLORS.primaryGradient as unknown as string[]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <Ionicons
            name={
              lesson.content_type === 'quiz' ? 'help-circle' :
              lesson.content_type === 'assignment' ? 'create' :
              lesson.content_type === 'exam' ? 'school' :
              'document-text'
            }
            size={48}
            color={COLORS.white}
          />
          <Text style={styles.headerTitle}>{lesson.title}</Text>
          <Text style={styles.headerSubtitle}>
            {lesson.content_type?.charAt(0).toUpperCase() + lesson.content_type?.slice(1)} · {lesson.duration_minutes || 0} min
          </Text>
        </LinearGradient>
      )}

      {/* Completion Badge */}
      {lesson.completed && (
        <View style={styles.completedBanner}>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.green} />
          <Text style={styles.completedText}>Voltooid</Text>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons
              name={tab.icon as any}
              size={16}
              color={activeTab === tab.id ? COLORS.purple : COLORS.gray[400]}
            />
            <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.purple} />
        }
      >
        {activeTab === 'content' && (
          <View style={styles.section}>
            {lesson.video_url && (
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
            )}
            {lesson.description ? (
              <Text style={styles.description}>{lesson.description}</Text>
            ) : null}
            {lesson.content ? (
              <Text style={styles.bodyText}>{lesson.content}</Text>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={40} color={COLORS.gray[600]} />
                <Text style={styles.emptyText}>Geen tekstinhoud beschikbaar</Text>
              </View>
            )}
            {lesson.transcript ? (
              <View style={styles.transcriptSection}>
                <Text style={styles.sectionLabel}>Transcript</Text>
                <Text style={styles.transcriptText}>{lesson.transcript}</Text>
              </View>
            ) : null}
          </View>
        )}

        {activeTab === 'resources' && (
          <View style={styles.section}>
            {resources.length > 0 ? (
              resources.map((resource) => (
                <TouchableOpacity key={resource.id} style={styles.resourceRow}>
                  <View style={styles.resourceIcon}>
                    <Ionicons
                      name={
                        resource.type === 'pdf' ? 'document' :
                        resource.type === 'video' ? 'videocam' :
                        resource.type === 'link' ? 'link' :
                        'document-attach'
                      }
                      size={20}
                      color={COLORS.purple}
                    />
                  </View>
                  <View style={styles.resourceInfo}>
                    <Text style={styles.resourceTitle}>{resource.title}</Text>
                    <Text style={styles.resourceType}>{resource.type?.toUpperCase()}</Text>
                  </View>
                  <Ionicons name="download-outline" size={20} color={COLORS.gray[400]} />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="folder-open-outline" size={40} color={COLORS.gray[600]} />
                <Text style={styles.emptyText}>Geen bronnen beschikbaar</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'takeaways' && (
          <View style={styles.section}>
            {lesson.key_takeaways && lesson.key_takeaways.length > 0 ? (
              lesson.key_takeaways.map((takeaway, index) => (
                <View key={index} style={styles.takeawayRow}>
                  <LinearGradient
                    colors={COLORS.primaryGradient as unknown as string[]}
                    style={styles.takeawayBullet}
                  >
                    <Text style={styles.takeawayNumber}>{index + 1}</Text>
                  </LinearGradient>
                  <Text style={styles.takeawayText}>{takeaway}</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="bulb-outline" size={40} color={COLORS.gray[600]} />
                <Text style={styles.emptyText}>Geen kernpunten beschikbaar</Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        {!lesson.completed ? (
          <TouchableOpacity
            style={[styles.completeBtn, completing && styles.btnDisabled]}
            onPress={markComplete}
            disabled={completing}
          >
            <LinearGradient
              colors={[COLORS.green, COLORS.emerald]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.completeBtnGradient}
            >
              {completing ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                  <Text style={styles.completeBtnText}>Markeer als voltooid</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.completedFooter}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.green} />
            <Text style={styles.completedFooterText}>Les voltooid</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[900],
  },
  center: {
    flex: 1,
    backgroundColor: COLORS.gray[900],
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    color: COLORS.gray[400],
    fontSize: 16,
  },
  backBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.gray[800],
  },
  backBtnText: {
    color: COLORS.purple,
    fontSize: 14,
    fontWeight: '600',
  },
  videoContainer: {
    width: SCREEN_WIDTH,
    height: VIDEO_HEIGHT,
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
  },
  headerGradient: {
    width: SCREEN_WIDTH,
    height: VIDEO_HEIGHT * 0.65,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  completedText: {
    color: COLORS.green,
    fontSize: 13,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[700],
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.purple,
  },
  tabText: {
    fontSize: 13,
    color: COLORS.gray[400],
    fontWeight: '600',
  },
  activeTabText: {
    color: COLORS.purple,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray[100],
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: COLORS.gray[400],
    lineHeight: 22,
    marginBottom: 16,
  },
  bodyText: {
    fontSize: 15,
    color: COLORS.gray[300],
    lineHeight: 24,
  },
  transcriptSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: COLORS.gray[800],
    borderRadius: 12,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gray[400],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  transcriptText: {
    fontSize: 13,
    color: COLORS.gray[400],
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    color: COLORS.gray[500],
    fontSize: 14,
  },
  resourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[800],
  },
  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: `${COLORS.purple}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[200],
  },
  resourceType: {
    fontSize: 11,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  takeawayRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  takeawayBullet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  takeawayNumber: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  takeawayText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.gray[300],
    lineHeight: 22,
    paddingTop: 3,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[700],
    padding: 16,
    paddingBottom: 32,
  },
  completeBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  completeBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  completeBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 15,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  completedFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  completedFooterText: {
    color: COLORS.green,
    fontWeight: '600',
    fontSize: 15,
  },
});

export default LessonPlayerScreen;

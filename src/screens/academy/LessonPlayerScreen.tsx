/**
 * LessonPlayerScreen - Connected to backend API
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Dimensions, RefreshControl,
} from 'react-native';
// LinearGradient replaced with plain View to avoid extra dependency
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

interface Lesson {
  id: number;
  title: string;
  description?: string;
  content?: string;
  content_type?: string;
  video_url?: string;
  duration_minutes?: number;
  completed?: boolean;
  transcript?: string;
  key_takeaways?: string[];
}

interface LessonResource {
  id: number;
  title: string;
  type: string;
  url?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_HEIGHT = (SCREEN_WIDTH * 9) / 16;

type TabId = 'content' | 'resources' | 'takeaways';

export function LessonPlayerScreen({ route, navigation }: any) {
  const { t } = useTranslation();
  const { courseId, lessonId } = route.params;
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [resources, setResources] = useState<LessonResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('content');

  const TABS: { id: TabId; name: string; icon: string }[] = [
    { id: 'content', name: t('academy.lessonPlayer'), icon: 'document-text' },
    { id: 'resources', name: t('common.noData').includes('No') ? 'Resources' : 'Bronnen', icon: 'folder-open' },
    { id: 'takeaways', name: t('common.noData').includes('No') ? 'Key Takeaways' : 'Kernpunten', icon: 'bulb' },
  ];

  const loadLesson = useCallback(async () => {
    try {
      const data = await api.get(`/academy/courses/${courseId}/lessons/${lessonId}/`).then(r => r.data);
      setLesson(data);
      try {
        const res = await api.get(`/academy/courses/${courseId}/lessons/${lessonId}/resources/`).then(r => r.data);
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
      await api.post(`/academy/courses/${courseId}/lessons/${lessonId}/complete/`);
      setLesson((prev: Lesson | null) => (prev ? { ...prev, completed: true } : prev));
    } catch {
      // silent
    } finally {
      setCompleting(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color="#6B7280" />
        <Text style={styles.errorText}>{t('common.loadError')}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>{t('common.back')}</Text>
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
        <View
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
            color="#FFFFFF"
          />
          <Text style={styles.headerTitle}>{lesson.title}</Text>
          <Text style={styles.headerSubtitle}>
            {lesson.content_type?.charAt(0).toUpperCase() + (lesson.content_type?.slice(1) || '')} · {lesson.duration_minutes || 0} min
          </Text>
        </View>
      )}

      {/* Completion Badge */}
      {lesson.completed && (
        <View style={styles.completedBanner}>
          <Ionicons name="checkmark-circle" size={16} color="#34D399" />
          <Text style={styles.completedText}>{t('academy.completed')}</Text>
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
              color={activeTab === tab.id ? '#7C3AED' : '#9CA3AF'}
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C3AED" />
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
                <Ionicons name="document-text-outline" size={40} color="#4B5563" />
                <Text style={styles.emptyText}>{t('common.noData')}</Text>
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
                      color="#7C3AED"
                    />
                  </View>
                  <View style={styles.resourceInfo}>
                    <Text style={styles.resourceTitle}>{resource.title}</Text>
                    <Text style={styles.resourceType}>{resource.type?.toUpperCase()}</Text>
                  </View>
                  <Ionicons name="download-outline" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="folder-open-outline" size={40} color="#4B5563" />
                <Text style={styles.emptyText}>{t('common.noData')}</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'takeaways' && (
          <View style={styles.section}>
            {lesson.key_takeaways && lesson.key_takeaways.length > 0 ? (
              lesson.key_takeaways.map((takeaway: string, index: number) => (
                <View key={index} style={styles.takeawayRow}>
                  <View
                    style={styles.takeawayBullet}
                  >
                    <Text style={styles.takeawayNumber}>{index + 1}</Text>
                  </View>
                  <Text style={styles.takeawayText}>{takeaway}</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="bulb-outline" size={40} color="#4B5563" />
                <Text style={styles.emptyText}>{t('common.noData')}</Text>
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
            <View
              style={styles.completeBtnGradient}
            >
              {completing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.completeBtnText}>{t('academy.markComplete')}</Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.completedFooter}>
            <Ionicons name="checkmark-circle" size={20} color="#34D399" />
            <Text style={styles.completedFooterText}>{t('academy.completed')}</Text>
          </View>
        )}
      </View>
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
    gap: 12,
  },
  errorText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  backBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1F2037',
  },
  backBtnText: {
    color: '#7C3AED',
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
    backgroundColor: '#7C3AED',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
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
    color: '#34D399',
    fontSize: 13,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
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
    borderBottomColor: '#7C3AED',
  },
  tabText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#7C3AED',
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
    color: '#F3F4F6',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 22,
    marginBottom: 16,
  },
  bodyText: {
    fontSize: 15,
    color: '#D1D5DB',
    lineHeight: 24,
  },
  transcriptSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#1F2037',
    borderRadius: 12,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  transcriptText: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 14,
  },
  resourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2037',
  },
  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  resourceType: {
    fontSize: 11,
    color: '#6B7280',
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
    backgroundColor: '#7C3AED',
  },
  takeawayNumber: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  takeawayText: {
    flex: 1,
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 22,
    paddingTop: 3,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#374151',
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
    backgroundColor: '#34D399',
    borderRadius: 12,
  },
  completeBtnText: {
    color: '#FFFFFF',
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
    color: '#34D399',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default LessonPlayerScreen;

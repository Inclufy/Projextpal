import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { myWorkService, MyWorkData, MyWorkTask } from '../../services/myWorkService';

const PRIORITY_COLOR: Record<string, string> = {
  urgent: '#dc2626', high: '#ea580c', medium: '#ca8a04', low: '#16a34a',
};

const BUCKETS: { key: keyof MyWorkData['buckets']; en: string; nl: string; color: string }[] = [
  { key: 'overdue', en: 'Overdue', nl: 'Te laat', color: '#dc2626' },
  { key: 'today', en: 'Today', nl: 'Vandaag', color: '#7c3aed' },
  { key: 'this_week', en: 'This week', nl: 'Deze week', color: '#2563eb' },
  { key: 'later', en: 'Later', nl: 'Later', color: '#6b7280' },
  { key: 'no_date', en: 'No date', nl: 'Geen datum', color: '#9ca3af' },
];

export const MyWorkScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isNL } = useLanguage();
  const [data, setData] = useState<MyWorkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setData(await myWorkService.getMyWork());
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setData(await myWorkService.getMyWork());
    setRefreshing(false);
  }, []);

  const openTask = (t: MyWorkTask) => {
    if (t.project_id) navigation.navigate('ProjectDetail', { projectId: String(t.project_id) });
  };

  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString(isNL ? 'nl-NL' : 'en-GB', { day: '2-digit', month: 'short' }) : '';

  const counts = data?.counts || { open: 0, overdue: 0, today: 0, mentions: 0 };
  const totalOpen = counts.open || 0;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#7c3aed', '#a855f7']} style={styles.header}>
        <Text style={styles.headerTitle}>{isNL ? 'Mijn werk' : 'My Work'}</Text>
        <Text style={styles.headerSub}>
          {totalOpen} {isNL ? 'open' : 'open'} · {counts.overdue} {isNL ? 'te laat' : 'overdue'} · {counts.mentions} @
        </Text>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#7c3aed" /></View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />}
        >
          {totalOpen === 0 && (data?.mentions.length || 0) === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="checkmark-done-circle-outline" size={56} color="#16a34a" />
              <Text style={styles.emptyTitle}>{isNL ? 'Alles bijgewerkt' : "You're all caught up"}</Text>
              <Text style={styles.emptySub}>{isNL ? 'Er staat niets open op jouw naam.' : 'Nothing open is assigned to you.'}</Text>
            </View>
          ) : (
            <>
              {BUCKETS.map((b) => {
                const items = data?.buckets[b.key] || [];
                if (items.length === 0) return null;
                return (
                  <View key={b.key} style={{ marginBottom: 18 }}>
                    <View style={styles.sectionHeader}>
                      <View style={[styles.dot, { backgroundColor: b.color }]} />
                      <Text style={styles.sectionTitle}>{isNL ? b.nl : b.en}</Text>
                      <Text style={styles.sectionCount}>{items.length}</Text>
                    </View>
                    {items.map((t) => (
                      <TouchableOpacity key={t.id} style={styles.card} onPress={() => openTask(t)} activeOpacity={0.7}>
                        <View style={[styles.prioBar, { backgroundColor: PRIORITY_COLOR[t.priority] || '#9ca3af' }]} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.cardTitle} numberOfLines={2}>{t.title}</Text>
                          <Text style={styles.cardMeta} numberOfLines={1}>
                            {t.project_name || (isNL ? 'Project' : 'Project')}{t.due_date ? ` · ${fmtDate(t.due_date)}` : ''}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#c4b5fd" />
                      </TouchableOpacity>
                    ))}
                  </View>
                );
              })}

              {(data?.mentions.length || 0) > 0 && (
                <View style={{ marginBottom: 18 }}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="at" size={16} color="#7c3aed" />
                    <Text style={styles.sectionTitle}>{isNL ? 'Vermeldingen' : 'Mentions'}</Text>
                    <Text style={styles.sectionCount}>{data?.mentions.length}</Text>
                  </View>
                  {data?.mentions.map((m) => (
                    <TouchableOpacity
                      key={m.id} style={styles.card} activeOpacity={0.7}
                      onPress={() => {
                        const pid = m.url.match(/projects\/(\d+)/)?.[1];
                        if (pid) navigation.navigate('ProjectDetail', { projectId: pid });
                      }}
                    >
                      <View style={[styles.prioBar, { backgroundColor: '#7c3aed' }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle} numberOfLines={2}>{m.body}</Text>
                        <Text style={styles.cardMeta} numberOfLines={1}>
                          {m.author || ''}{m.project_name ? ` · ${m.project_name}` : ''}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color="#c4b5fd" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { color: '#fff', fontSize: 26, fontWeight: '800' },
  headerSub: { color: '#ede9fe', fontSize: 13, marginTop: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginTop: 12 },
  emptySub: { fontSize: 13, color: '#6b7280', marginTop: 4, textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#374151', flex: 1 },
  sectionCount: { fontSize: 12, fontWeight: '700', color: '#9ca3af' },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14,
    padding: 12, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  prioBar: { width: 4, alignSelf: 'stretch', borderRadius: 2, marginRight: 12 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  cardMeta: { fontSize: 12, color: '#6b7280', marginTop: 3 },
});

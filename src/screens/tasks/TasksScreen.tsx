import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { tasksService, Task } from '../../services/tasksService';

const TABS = ['all', 'todo', 'in_progress', 'done'] as const;

export const TasksScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isNL } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => { loadTasks(); }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await tasksService.getTasks();
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  }, []);

  const filteredTasks = activeTab === 'all' ? tasks : tasks.filter(t => t.status === activeTab);

  const getTabLabel = (tab: string) => {
    const labels: Record<string, string> = isNL
      ? { all: 'Alles', todo: 'Te doen', in_progress: 'Bezig', done: 'Klaar' }
      : { all: 'All', todo: 'To Do', in_progress: 'In Progress', done: 'Done' };
    return labels[tab] || tab;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#DC2626';
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      default: return '#10B981';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return 'checkmark-circle';
      case 'in_progress': return 'time';
      case 'review': return 'eye';
      default: return 'ellipse-outline';
    }
  };

  const renderTask = ({ item }: { item: Task }) => (
    <TouchableOpacity style={styles.taskCard}>
      <View style={styles.taskLeft}>
        <Ionicons name={getStatusIcon(item.status) as any} size={22} color={item.status === 'done' ? '#10B981' : '#8B5CF6'} />
      </View>
      <View style={styles.taskContent}>
        <Text style={[styles.taskTitle, item.status === 'done' && styles.taskDone]}>{item.title}</Text>
        {item.project_name && <Text style={styles.taskProject}>{item.project_name}</Text>}
        <View style={styles.taskMeta}>
          <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(item.priority) }]} />
          <Text style={styles.taskMetaText}>{item.priority}</Text>
          {item.due_date && (
            <>
              <Ionicons name="calendar-outline" size={12} color="#9CA3AF" style={{ marginLeft: 8 }} />
              <Text style={styles.taskMetaText}>{new Date(item.due_date).toLocaleDateString()}</Text>
            </>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#2563EB', '#3B82F6']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>{isNL ? 'Taken' : 'Tasks'}</Text>
        <View style={styles.headerStats}>
          <Text style={styles.statsText}>{tasks.length} {isNL ? 'totaal' : 'total'}</Text>
        </View>
      </LinearGradient>

      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{getTabLabel(tab)}</Text>
            {activeTab === tab && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          renderItem={renderTask}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-circle-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>{isNL ? 'Geen taken gevonden' : 'No tasks found'}</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: 'white', flex: 1 },
  headerStats: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statsText: { color: 'white', fontSize: 13, fontWeight: '600' },
  tabBar: { flexDirection: 'row', backgroundColor: 'white', paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', position: 'relative' },
  tabActive: {},
  tabText: { fontSize: 13, fontWeight: '600', color: '#9CA3AF' },
  tabTextActive: { color: '#3B82F6' },
  tabIndicator: { position: 'absolute', bottom: 0, height: 2, width: '60%', backgroundColor: '#3B82F6', borderRadius: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  taskCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  taskLeft: { marginRight: 12 },
  taskContent: { flex: 1 },
  taskTitle: { fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 2 },
  taskDone: { textDecorationLine: 'line-through', color: '#9CA3AF' },
  taskProject: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  taskMeta: { flexDirection: 'row', alignItems: 'center' },
  priorityDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  taskMetaText: { fontSize: 11, color: '#9CA3AF', marginLeft: 2 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16, color: '#9CA3AF', marginTop: 12 },
});

export default TasksScreen;

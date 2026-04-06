import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, Alert, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { programsService, Program } from '../../services/programs';
import { useTranslation } from 'react-i18next'; // ✅ ADD THIS

export const ProgramsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t, i18n } = useTranslation(); // ✅ ADD THIS
  
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [newProgram, setNewProgram] = useState({
    name: '',
    description: '',
    status: 'active',
  });

  // ✅ Dynamic locale helper
  const getLocale = () => i18n.language === 'nl' ? 'nl-NL' : 'en-US';

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const data = await programsService.getPrograms();
      setPrograms(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Failed to load programs:', error);
      Alert.alert(t('common.error'), t('programs.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await programsService.getPrograms();
      setPrograms(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Failed to refresh programs:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleAddProgram = async () => {
    if (!newProgram.name.trim()) {
      Alert.alert(t('common.error'), t('programs.validation.nameRequired'));
      return;
    }

    try {
      setSubmitting(true);
      await programsService.createProgram({
        name: newProgram.name.trim(),
        description: newProgram.description.trim(),
        status: newProgram.status,
      });
      
      Alert.alert(t('common.success'), t('programs.success.created'));
      setShowAddModal(false);
      setNewProgram({ name: '', description: '', status: 'active' });
      
      // Refresh list
      await onRefresh();
    } catch (error) {
      console.error('Failed to create program:', error);
      Alert.alert(t('common.error'), t('programs.errors.createFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return '#10B981';
      case 'completed': return '#3B82F6';
      case 'on_hold': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    const statusKey = status?.toLowerCase();
    switch (statusKey) {
      case 'active':
        return t('programs.status.active');
      case 'completed':
        return t('programs.status.completed');
      case 'on_hold':
        return t('programs.status.on_hold');
      case 'planning':
        return t('programs.status.planning');
      default:
        return status;
    }
  };

  const renderProgram = ({ item }: { item: Program }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate("ProgramDetail", { programId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.icon}>
          <Ionicons name="briefcase" size={24} color="#3B82F6" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.cardDesc} numberOfLines={2}>
            {item.description || t('programs.noDescription')}
          </Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
      </View>
      
      <View style={styles.cardFooter}>
        <View style={styles.badge}>
          <Ionicons name="folder" size={14} color="#6B7280" />
          <Text style={styles.badgeText}>
            {item.projects_count || 0} {t('programs.projectsCount')}
          </Text>
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${item.progress || 0}%` }]} />
          </View>
          <Text style={styles.progressText}>{item.progress || 0}%</Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        {item.budget && (
          <View style={styles.quickStatItem}>
            <Ionicons name="wallet-outline" size={14} color="#10B981" />
            <Text style={styles.quickStatText}>
              €{item.budget.toLocaleString(getLocale())}
            </Text>
          </View>
        )}
        {item.start_date && (
          <View style={styles.quickStatItem}>
            <Ionicons name="calendar-outline" size={14} color="#8B5CF6" />
            <Text style={styles.quickStatText}>
              {new Date(item.start_date).toLocaleDateString(getLocale(), { 
                day: 'numeric', 
                month: 'short', 
                year: '2-digit' 
              })}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // Calculate stats
  const totalProjects = programs.reduce((sum, p) => sum + (p.projects_count || 0), 0);
  const avgProgress = programs.length > 0 
    ? Math.round(programs.reduce((sum, p) => sum + (p.progress || 0), 0) / programs.length)
    : 0;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#3B82F6', '#8B5CF6']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('programs.title')}</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Stats Summary */}
      <View style={styles.statsBar}>
        <View style={styles.statsItem}>
          <Text style={styles.statsNumber}>{programs.length}</Text>
          <Text style={styles.statsLabel}>{t('programs.stats.programs')}</Text>
        </View>
        <View style={styles.statsDivider} />
        <View style={styles.statsItem}>
          <Text style={[styles.statsNumber, { color: '#3B82F6' }]}>{totalProjects}</Text>
          <Text style={styles.statsLabel}>{t('programs.stats.projects')}</Text>
        </View>
        <View style={styles.statsDivider} />
        <View style={styles.statsItem}>
          <Text style={[styles.statsNumber, { color: '#10B981' }]}>{avgProgress}%</Text>
          <Text style={styles.statsLabel}>{t('programs.stats.avgProgress')}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <FlatList
          data={programs}
          renderItem={renderProgram}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#3B82F6']}
              tintColor="#3B82F6"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="briefcase-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>{t('programs.noPrograms')}</Text>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={() => setShowAddModal(true)}
              >
                <Text style={styles.emptyButtonText}>+ {t('programs.addNew')}</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Add Program Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('programs.modal.title')}</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>{t('programs.modal.name')} *</Text>
            <TextInput
              style={styles.input}
              placeholder={t('programs.modal.namePlaceholder')}
              value={newProgram.name}
              onChangeText={(text) => setNewProgram(prev => ({ ...prev, name: text }))}
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.inputLabel}>{t('programs.modal.description')}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={t('programs.modal.descriptionPlaceholder')}
              value={newProgram.description}
              onChangeText={(text) => setNewProgram(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={4}
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.inputLabel}>{t('programs.modal.status')}</Text>
            <View style={styles.statusOptions}>
              {['active', 'on_hold'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    newProgram.status === status && styles.statusOptionActive
                  ]}
                  onPress={() => setNewProgram(prev => ({ ...prev, status }))}
                >
                  <Text style={[
                    styles.statusOptionText,
                    newProgram.status === status && styles.statusOptionTextActive
                  ]}>
                    {status === 'active' ? t('programs.status.active') : t('programs.status.on_hold')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleAddProgram}
              disabled={submitting}
            >
              <LinearGradient colors={['#3B82F6', '#8B5CF6']} style={styles.submitGradient}>
                {submitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>{t('programs.modal.submit')}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  backButton: { padding: 8 },
  title: { flex: 1, fontSize: 24, fontWeight: 'bold', color: 'white', textAlign: 'center' },
  addButton: { padding: 8 },
  
  statsBar: { flexDirection: 'row', backgroundColor: 'white', marginHorizontal: 20, marginTop: -10, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  statsItem: { flex: 1, alignItems: 'center' },
  statsNumber: { fontSize: 24, fontWeight: 'bold', color: '#1F2937' },
  statsLabel: { fontSize: 11, color: '#6B7280', marginTop: 4 },
  statsDivider: { width: 1, backgroundColor: '#E5E7EB' },
  
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 20 },
  
  card: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  icon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 4 },
  cardDesc: { fontSize: 14, color: '#6b7280', lineHeight: 20 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  badgeText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  progressContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, marginLeft: 16 },
  progressBar: { flex: 1, height: 6, backgroundColor: '#e5e7eb', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#3B82F6', borderRadius: 3 },
  progressText: { fontSize: 12, fontWeight: '600', color: '#1f2937', minWidth: 32 },
  
  quickStats: { flexDirection: 'row', gap: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  quickStatItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  quickStatText: { fontSize: 12, color: '#6B7280' },
  
  emptyContainer: { justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { fontSize: 16, color: '#9CA3AF', marginTop: 16, marginBottom: 16 },
  emptyButton: { backgroundColor: '#EFF6FF', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  emptyButtonText: { fontSize: 14, fontWeight: '600', color: '#3B82F6' },
  
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
  input: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB', color: '#1F2937' },
  textArea: { height: 100, textAlignVertical: 'top' },
  
  statusOptions: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statusOption: { flex: 1, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: 2, borderColor: '#E5E7EB', alignItems: 'center' },
  statusOptionActive: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  statusOptionText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  statusOptionTextActive: { color: '#3B82F6' },
  
  submitButton: { borderRadius: 12, overflow: 'hidden', marginTop: 8 },
  submitButtonDisabled: { opacity: 0.7 },
  submitGradient: { paddingVertical: 16, alignItems: 'center' },
  submitButtonText: { fontSize: 16, fontWeight: '600', color: 'white' },
});
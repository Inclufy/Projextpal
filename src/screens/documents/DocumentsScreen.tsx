import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { documentsService, Document } from '../../services/documentsService';

export const DocumentsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isNL } = useLanguage();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadDocuments(); }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentsService.getDocuments();
      setDocuments(data);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDocuments();
    setRefreshing(false);
  }, []);

  const getFileIcon = (type: string): string => {
    const t = (type || '').toLowerCase();
    if (t.includes('pdf')) return 'document-text';
    if (t.includes('doc') || t.includes('word')) return 'document';
    if (t.includes('xls') || t.includes('sheet')) return 'grid';
    if (t.includes('ppt') || t.includes('presentation')) return 'easel';
    if (t.includes('image') || t.includes('png') || t.includes('jpg')) return 'image';
    return 'document-outline';
  };

  const getFileColor = (type: string): string => {
    const t = (type || '').toLowerCase();
    if (t.includes('pdf')) return '#EF4444';
    if (t.includes('doc') || t.includes('word')) return '#3B82F6';
    if (t.includes('xls') || t.includes('sheet')) return '#10B981';
    if (t.includes('ppt') || t.includes('presentation')) return '#F59E0B';
    return '#6B7280';
  };

  const formatSize = (bytes: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderDocument = ({ item }: { item: Document }) => (
    <TouchableOpacity style={styles.docCard}>
      <View style={[styles.fileIcon, { backgroundColor: getFileColor(item.file_type) + '15' }]}>
        <Ionicons name={getFileIcon(item.file_type) as any} size={24} color={getFileColor(item.file_type)} />
      </View>
      <View style={styles.docInfo}>
        <Text style={styles.docName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.docMeta}>
          {item.project_name && <Text style={styles.docProject}>{item.project_name}</Text>}
          <Text style={styles.docSize}>{formatSize(item.size)}</Text>
          <Text style={styles.docDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#14B8A6', '#06B6D4']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>{isNL ? 'Documenten' : 'Documents'}</Text>
        <View style={styles.headerStats}>
          <Text style={styles.statsText}>{documents.length}</Text>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#14B8A6" />
        </View>
      ) : (
        <FlatList
          data={documents}
          renderItem={renderDocument}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#14B8A6']} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>{isNL ? 'Geen documenten gevonden' : 'No documents found'}</Text>
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  docCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  fileIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  docInfo: { flex: 1 },
  docName: { fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  docMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  docProject: { fontSize: 12, color: '#8B5CF6', fontWeight: '500' },
  docSize: { fontSize: 12, color: '#9CA3AF' },
  docDate: { fontSize: 12, color: '#9CA3AF' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16, color: '#9CA3AF', marginTop: 12 },
});

export default DocumentsScreen;

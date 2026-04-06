import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { risksService, Risk } from '../../services/risks';

export const RisksScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRisks();
  }, []);

  const loadRisks = async () => {
    try {
      setLoading(true);
      const data = await risksService.getRisks();
      setRisks(data);
    } catch (error) {
      console.error('Failed to load risks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return '#DC2626';
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const renderRisk = ({ item }: { item: Risk }) => (
    <TouchableOpacity style={styles.riskCard}>
      <View style={styles.riskHeader}>
        <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
          <Ionicons name="warning" size={16} color="white" />
          <Text style={styles.severityText}>{item.severity}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <Text style={styles.riskTitle}>{item.title}</Text>
      <Text style={styles.riskDesc} numberOfLines={2}>{item.description}</Text>
      
      <View style={styles.riskFooter}>
        <View style={styles.riskMeta}>
          <Ionicons name="analytics" size={14} color="#6B7280" />
          <Text style={styles.metaText}>Kans: {item.probability}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#EC4899', '#8B5CF6']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Risico's</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EC4899" />
        </View>
      ) : (
        <FlatList
          data={risks}
          renderItem={renderRisk}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="shield-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>Geen risico's gevonden</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  backButton: { padding: 8 },
  title: { flex: 1, fontSize: 24, fontWeight: 'bold', color: 'white', textAlign: 'center' },
  addButton: { padding: 8 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 20 },
  riskCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  riskHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  severityBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  severityText: { fontSize: 12, fontWeight: '600', color: 'white', textTransform: 'capitalize' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: '#F3F4F6' },
  statusText: { fontSize: 12, fontWeight: '600', color: '#6B7280', textTransform: 'capitalize' },
  riskTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
  riskDesc: { fontSize: 14, color: '#6B7280', marginBottom: 12 },
  riskFooter: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 },
  riskMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, color: '#6B7280', fontWeight: '500', textTransform: 'capitalize' },
  emptyContainer: { justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { fontSize: 16, color: '#9CA3AF', marginTop: 16 },
});

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { teamService, TeamMember } from '../../services/teamService';

export const TeamScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isNL } = useLanguage();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadMembers(); }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await teamService.getMembers();
      setMembers(data);
    } catch (error) {
      console.error('Failed to load team:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMembers();
    setRefreshing(false);
  }, []);

  const getInitials = (member: TeamMember) => {
    return `${(member.first_name || '')[0] || ''}${(member.last_name || '')[0] || ''}`.toUpperCase() || '?';
  };

  const getAvatarColor = (index: number) => {
    const colors = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#6366F1'];
    return colors[index % colors.length];
  };

  const renderMember = ({ item, index }: { item: TeamMember; index: number }) => (
    <TouchableOpacity style={styles.memberCard}>
      <View style={[styles.avatar, { backgroundColor: getAvatarColor(index) }]}>
        <Text style={styles.avatarText}>{getInitials(item)}</Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.first_name} {item.last_name}</Text>
        <Text style={styles.memberRole}>{item.role}</Text>
        <Text style={styles.memberEmail}>{item.email}</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: item.is_active ? '#DCFCE7' : '#FEE2E2' }]}>
        <View style={[styles.statusDot, { backgroundColor: item.is_active ? '#10B981' : '#EF4444' }]} />
        <Text style={[styles.statusText, { color: item.is_active ? '#166534' : '#991B1B' }]}>
          {item.is_active ? (isNL ? 'Actief' : 'Active') : (isNL ? 'Inactief' : 'Inactive')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const activeCount = members.filter(m => m.is_active).length;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Team</Text>
        <View style={styles.headerStats}>
          <Text style={styles.statsText}>{activeCount} {isNL ? 'actief' : 'active'}</Text>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : (
        <FlatList
          data={members}
          renderItem={renderMember}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366F1']} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>{isNL ? 'Geen teamleden gevonden' : 'No team members found'}</Text>
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
  memberCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  avatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  memberRole: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  memberEmail: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  statusText: { fontSize: 11, fontWeight: '600' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16, color: '#9CA3AF', marginTop: 12 },
});

export default TeamScreen;

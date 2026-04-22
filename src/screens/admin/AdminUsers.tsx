import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { adminService, AdminUser as User } from '../../services/adminService';

export const AdminUsers: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, statsData] = await Promise.all([
        adminService.getUsers(),
        adminService.getUserStats(),
      ]);
      setUsers(usersData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleAddUser = () => {
    // Navigate to add user screen or show modal
    Alert.alert('Add User', 'User creation screen will be implemented');
  };

  const handleUserPress = (user: User) => {
    // Navigate to user detail screen
    Alert.alert('User Details', `View details for ${user.name}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8B5CF6']} />}
    >
      <Text style={styles.pageTitle}>👥 {t('users.title')}</Text>
      <Text style={styles.pageSubtitle}>{t('users.subtitle')}</Text>
      
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>{t('users.total')}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: '#10B981' }]}>{stats.active}</Text>
          <Text style={styles.statLabel}>{t('users.active')}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: '#EF4444' }]}>{stats.inactive}</Text>
          <Text style={styles.statLabel}>{t('users.inactive')}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.addButton} onPress={handleAddUser}>
        <LinearGradient colors={['#8B5CF6', '#EC4899']} style={styles.addButtonGradient}>
          <Ionicons name="person-add" size={20} color="white" />
          <Text style={styles.addButtonText}>{t('users.addNew')}</Text>
        </LinearGradient>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>{t('users.usersList')}</Text>
      
      {users.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyText}>No users found</Text>
        </View>
      ) : (
        users.map((user) => (
          <TouchableOpacity key={user.id} style={styles.userCard} onPress={() => handleUserPress(user)}>
            <View style={styles.userHeader}>
              <View style={[
                styles.userAvatar, 
                { backgroundColor: user.status === 'active' ? '#8B5CF6' : '#9CA3AF' }
              ]}>
                <Text style={styles.userAvatarText}>{user.name.charAt(0)}</Text>
                {user.is_online && <View style={styles.onlineDot} />}
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <Text style={styles.userRole}>{user.company} • {user.role}</Text>
              </View>
              <View style={[
                styles.statusPill, 
                user.status === 'active' ? styles.statusActive : styles.statusInactive
              ]}>
                <Text style={styles.statusText}>
                  {user.status === 'active' ? t('users.active') : t('users.inactive')}
                </Text>
              </View>
            </View>
            <Text style={styles.lastLogin}>
              {t('users.lastLogin')}: {user.is_online ? t('users.nowOnline') : user.last_login}
            </Text>
          </TouchableOpacity>
        ))
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { fontSize: 16, color: '#6B7280', marginTop: 16 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  pageSubtitle: { fontSize: 15, color: '#6B7280', marginBottom: 20 },
  
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statBox: { flex: 1, backgroundColor: 'white', borderRadius: 12, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3 },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#6B7280' },
  
  addButton: { borderRadius: 12, overflow: 'hidden', marginBottom: 24, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  addButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10 },
  addButtonText: { fontSize: 16, fontWeight: '600', color: 'white' },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 },
  
  emptyState: { alignItems: 'center', paddingVertical: 64 },
  emptyText: { fontSize: 16, color: '#6B7280', marginTop: 16 },
  
  userCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  userHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  userAvatar: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginRight: 16, position: 'relative' },
  userAvatarText: { fontSize: 22, fontWeight: 'bold', color: 'white' },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#10B981', borderWidth: 2, borderColor: 'white' },
  userInfo: { flex: 1 },
  userName: { fontSize: 17, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  userEmail: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  userRole: { fontSize: 12, color: '#8B5CF6', fontWeight: '600' },
  statusPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusActive: { backgroundColor: '#DCFCE7' },
  statusInactive: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 11, fontWeight: '700', color: '#1F2937' },
  lastLogin: { fontSize: 12, color: '#6B7280', marginTop: 8 },
});
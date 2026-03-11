import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
  }

  const menuItems = [
    { icon: 'person-outline' as const, label: 'Account Settings', screen: 'Settings' },
    { icon: 'shield-checkmark-outline' as const, label: 'Security & 2FA', screen: 'Settings' },
    { icon: 'notifications-outline' as const, label: 'Notifications', screen: 'Settings' },
    { icon: 'globe-outline' as const, label: 'Language', screen: 'Settings' },
    { icon: 'moon-outline' as const, label: 'Appearance', screen: 'Settings' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.name}>
          {user?.first_name} {user?.last_name}
        </Text>
        <Text style={styles.email}>{user?.email}</Text>
        {user?.organization && (
          <Text style={styles.org}>{user.organization}</Text>
        )}
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {user?.role?.replace('_', ' ').toUpperCase() || 'USER'}
          </Text>
        </View>
      </View>

      {user?.subscription_tier && (
        <View style={styles.planCard}>
          <View style={styles.planInfo}>
            <Text style={styles.planLabel}>Current Plan</Text>
            <Text style={styles.planName}>{user.subscription_tier}</Text>
          </View>
          <Ionicons name="diamond" size={24} color="#FBBF24" />
        </View>
      )}

      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Ionicons name={item.icon} size={20} color="#9CA3AF" />
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#4B5563" />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        <Text style={styles.logoutText}>{t('auth.logout')}</Text>
      </TouchableOpacity>

      <Text style={styles.version}>ProjeXtPal v1.0.0</Text>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191A2E',
  },
  profileCard: {
    alignItems: 'center',
    padding: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2037',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F3F4F6',
  },
  email: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  org: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: '#818CF820',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 12,
  },
  roleText: {
    color: '#818CF8',
    fontSize: 11,
    fontWeight: '700',
  },
  planCard: {
    backgroundColor: '#1F2037',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planInfo: {},
  planLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FBBF24',
    textTransform: 'capitalize',
  },
  menu: {
    margin: 16,
    backgroundColor: '#1F2037',
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#292A40',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuLabel: {
    fontSize: 15,
    color: '#D1D5DB',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    margin: 16,
    padding: 16,
    backgroundColor: '#1F2037',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF444430',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    color: '#4B5563',
    fontSize: 12,
    marginTop: 8,
  },
});

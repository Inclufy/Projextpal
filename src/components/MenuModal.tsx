import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { COLORS } from '../constants/colors';

interface MenuModalProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;
}

export const MenuModal: React.FC<MenuModalProps> = ({ visible, onClose, navigation }) => {
  const { logout, user, isSuperAdmin } = useAuthStore();

  const menuItems = [
    { name: 'Dashboard', icon: 'home', screen: 'Dashboard', enabled: true },
    { name: 'AI Chat', icon: 'chatbubbles', screen: 'AIChat', enabled: true },
    { name: 'Projecten', icon: 'folder', screen: 'Projects', enabled: true },
    { name: "Programma's", icon: 'briefcase', screen: 'Programs', enabled: true },
    { name: 'Time Tracking', icon: 'time', screen: 'TimeTracking', enabled: true },
    { name: 'Budget', icon: 'wallet', screen: 'Budget', enabled: true },
    { name: "Risico's", icon: 'shield', screen: 'Risks', enabled: true },
    { name: 'Academy', icon: 'school', screen: 'Academy', enabled: true },
    { name: 'Team', icon: 'people', screen: null, enabled: false },
    { name: 'Documenten', icon: 'document-text', screen: null, enabled: false },
    { name: 'Instellingen', icon: 'settings', screen: null, enabled: false },
  ];

  // Add Admin Portal for superadmins
  if (isSuperAdmin()) {
    menuItems.splice(1, 0, { 
      name: 'Admin Portal', 
      icon: 'shield-checkmark', 
      screen: 'AdminPortal', 
      enabled: true 
    });
  }

  const handleNavigate = (screen: string | null) => {
    if (screen) {
      navigation.navigate(screen);
      onClose();
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.menuContainer}>
          <LinearGradient colors={COLORS.primaryGradient} style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Menu</Text>
              <Text style={styles.headerSubtitle}>{user?.email}</Text>
              {isSuperAdmin() && (
                <View style={styles.superadminBadge}>
                  <Ionicons name="shield-checkmark" size={12} color="#F59E0B" />
                  <Text style={styles.superadminText}>Superadmin</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView style={styles.menuItems} showsVerticalScrollIndicator={false}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.menuItem, !item.enabled && styles.menuItemDisabled]}
                onPress={() => handleNavigate(item.screen)}
                disabled={!item.enabled}
              >
                <View style={styles.menuItemContent}>
                  <Ionicons 
                    name={item.icon as any} 
                    size={24} 
                    color={item.enabled ? '#8B5CF6' : '#D1D5DB'} 
                  />
                  <Text style={[styles.menuItemText, !item.enabled && styles.menuItemTextDisabled]}>
                    {item.name}
                  </Text>
                </View>
                {item.enabled ? (
                  <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                ) : (
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>Soon</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out" size={24} color="#EF4444" />
              <Text style={styles.logoutText}>Uitloggen</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  menuContainer: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  superadminBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245,158,11,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginTop: 8, alignSelf: 'flex-start', gap: 4 },
  superadminText: { fontSize: 11, fontWeight: 'bold', color: '#F59E0B' },
  closeButton: { padding: 4 },
  menuItems: { paddingHorizontal: 24 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  menuItemDisabled: { opacity: 0.5 },
  menuItemContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  menuItemText: { fontSize: 16, fontWeight: '500', color: '#1F2937' },
  menuItemTextDisabled: { color: '#9CA3AF' },
  comingSoonBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  comingSoonText: { fontSize: 11, fontWeight: 'bold', color: '#F59E0B' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 20, marginTop: 16, borderTopWidth: 2, borderTopColor: '#F3F4F6' },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#EF4444' },
});

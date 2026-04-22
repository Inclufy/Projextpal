import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useAuthStore } from '../../store/authStore';
import { useLanguage } from '../../contexts/LanguageContext';
import { apiService } from '../../services/apiService';
import { authService } from '../../services/auth';
import { CommonActions } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

interface UserStats {
  courses_enrolled: number;
  courses_completed: number;
  certificates: number;
  streak_days: number;
  total_hours: number;
  projects_count: number;
}

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const { t, isNL, setLanguage } = useLanguage();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(user?.profile_image || null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Replace with actual API call when available
      // const response = await apiClient.get('/users/me/stats/');
      // setStats(response.data);
      
      // Simulated data for now
      setTimeout(() => {
        setStats({
          courses_enrolled: 5,
          courses_completed: 3,
          certificates: 2,
          streak_days: 12,
          total_hours: 48,
          projects_count: 7,
        });
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to load stats:', error);
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }, []);

  const handlePickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Toestemming vereist',
          'We hebben toegang tot je fotobibliotheek nodig om een profielfoto te kiezen.'
        );
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingImage(true);
        const imageUri = result.assets[0].uri;
        
        try {
          // Upload to backend
          const uploadedUrl = await authService.uploadProfileImage(imageUri);
          setProfileImage(uploadedUrl);
          
          // Update user in auth store
          const { updateUser } = useAuthStore.getState();
          if (user) {
            updateUser({ ...user, profile_image: uploadedUrl });
          }
          
          Alert.alert('Succes', 'Profielfoto bijgewerkt');
        } catch (uploadError) {
          console.error('Upload failed:', uploadError);
          // Fallback: set locally if upload fails
          setProfileImage(imageUri);
          Alert.alert('Waarschuwing', 'Foto lokaal opgeslagen, niet geüpload naar server');
        }
        
        setUploadingImage(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Fout', 'Kon afbeelding niet laden');
      setUploadingImage(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      isNL ? 'Uitloggen' : 'Sign Out',
      isNL ? 'Weet je zeker dat je wilt uitloggen?' : 'Are you sure you want to sign out?',
      [
        { text: isNL ? 'Annuleren' : 'Cancel', style: 'cancel' },
        {
          text: isNL ? 'Uitloggen' : 'Sign Out',
          style: 'destructive',
          onPress: async () => {
  try {
    console.log('🔄 Logging out...');
    
    // Logout clears tokens automatically
    await logout();
    console.log('✅ Logout complete');
  } catch (error) {
    console.error('❌ Error:', error);
  }
},
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: 'person-outline',
      label: isNL ? 'Persoonlijke gegevens' : 'Personal Information',
      onPress: () => navigation.navigate('EditProfile'),
      color: '#8B5CF6',
    },
    {
    icon: 'diamond-outline',  // 💎 Diamond icon
    label: isNL ? 'Abonnement Upgraden' : 'Upgrade Subscription',
    onPress: () => navigation.navigate('Pricing'),
    color: '#F59E0B',  // Oranje kleur
    },
    {
      icon: 'briefcase-outline',
      label: isNL ? 'Mijn Projecten' : 'My Projects',
      onPress: () => navigation.navigate('Projects'),
      color: '#3B82F6',
    },
    {
      icon: 'time-outline',
      label: isNL ? 'Urenregistratie' : 'Time Tracking',
      onPress: () => navigation.navigate('TimeTracking'),
      color: '#10B981',
    },
    {
      icon: 'notifications-outline',
      label: isNL ? 'Meldingen' : 'Notifications',
      onPress: () => navigation.navigate('Notifications'),
      color: '#F59E0B',
    },
    {
      icon: 'shield-checkmark-outline',
      label: isNL ? 'Privacy & Beveiliging' : 'Privacy & Security',
      onPress: () => navigation.navigate('Privacy'),
      color: '#EC4899',
    },
    {
      icon: 'help-circle-outline',
      label: isNL ? 'Help & Ondersteuning' : 'Help & Support',
      onPress: () => navigation.navigate('Support'),
      color: '#6366F1',
    },
    {
      icon: 'information-circle-outline',
      label: isNL ? 'Over ProjeXtPal' : 'About ProjeXtPal',
      onPress: () => navigation.navigate('About'),
      color: '#14B8A6',
    },
  ];

  const StatCard = ({ icon, value, label, color }: { icon: string; value: number | string; label: string; color: string }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8B5CF6']} />
      }
    >
      {/* Header with Profile */}
      <LinearGradient
        colors={['#8B5CF6', '#EC4899']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            <TouchableOpacity 
              style={styles.editAvatarButton}
              onPress={handlePickImage}
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="camera" size={14} color="white" />
              )}
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>
            {user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`
              : user?.email?.split('@')[0] || 'Gebruiker'}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          
          {user?.role && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {user.role === 'admin' ? 'Administrator' : 
                 user.role === 'manager' ? 'Manager' : 
                 isNL ? 'Teamlid' : 'Team Member'}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        {loading ? (
          <ActivityIndicator color="#8B5CF6" style={{ padding: 20 }} />
        ) : stats && (
          <View style={styles.statsGrid}>
            <StatCard 
              icon="school" 
              value={stats.courses_enrolled} 
              label={isNL ? 'Cursussen' : 'Courses'}
              color="#8B5CF6"
            />
            <StatCard 
              icon="ribbon" 
              value={stats.certificates} 
              label={isNL ? 'Certificaten' : 'Certificates'}
              color="#F59E0B"
            />
            <StatCard 
              icon="flame" 
              value={stats.streak_days} 
              label={isNL ? 'Dagen Streak' : 'Day Streak'}
              color="#EF4444"
            />
            <StatCard 
              icon="folder" 
              value={stats.projects_count} 
              label={isNL ? 'Projecten' : 'Projects'}
              color="#10B981"
            />
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>{isNL ? 'Snelle Acties' : 'Quick Actions'}</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('NewProject')}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="add-circle" size={24} color="#8B5CF6" />
            </View>
            <Text style={styles.quickActionLabel}>{isNL ? 'Nieuw Project' : 'New Project'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('TimeTracking')}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="time" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.quickActionLabel}>{isNL ? 'Uren Loggen' : 'Log Time'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('Reports')}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="bar-chart" size={24} color="#10B981" />
            </View>
            <Text style={styles.quickActionLabel}>{isNL ? 'Rapportages' : 'Reports'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        <Text style={styles.sectionTitle}>{isNL ? 'Instellingen' : 'Settings'}</Text>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={styles.menuItemLabel}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Language Toggle */}
      <View style={styles.languageSection}>
        <Text style={styles.sectionTitle}>{isNL ? 'Taal' : 'Language'}</Text>
        <View style={styles.languageToggle}>
          <TouchableOpacity 
            style={[styles.langOption, isNL && styles.langOptionActive]}
            onPress={() => setLanguage && setLanguage('nl')}
          >
            <Text style={[styles.langText, isNL && styles.langTextActive]}>🇳🇱 Nederlands</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.langOption, !isNL && styles.langOptionActive]}
            onPress={() => setLanguage && setLanguage('en')}
          >
            <Text style={[styles.langText, !isNL && styles.langTextActive]}>🇬🇧 English</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        <Text style={styles.logoutButtonText}>{isNL ? 'Uitloggen' : 'Sign Out'}</Text>
      </TouchableOpacity>

      {/* Version */}
      <Text style={styles.version}>ProjeXtPal v1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  
  header: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 24 },
  profileContainer: { alignItems: 'center' },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)' },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: '#8B5CF6' },
  editAvatarButton: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: '#8B5CF6', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white' },
  userName: { fontSize: 22, fontWeight: 'bold', color: 'white', marginBottom: 4 },
  userEmail: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 12 },
  roleBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  roleText: { color: 'white', fontSize: 12, fontWeight: '600' },

  statsContainer: { marginTop: -20, marginHorizontal: 16, marginBottom: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: 'white', borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  statIconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 2 },
  statLabel: { fontSize: 12, color: '#6B7280' },

  quickActions: { paddingHorizontal: 16, marginBottom: 16 },
  quickActionsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  quickAction: { alignItems: 'center', flex: 1 },
  quickActionIcon: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  quickActionLabel: { fontSize: 12, color: '#6B7280', textAlign: 'center' },

  menuContainer: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 12 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 8 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  menuIconContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  menuItemLabel: { fontSize: 15, color: '#1F2937', fontWeight: '500' },

  languageSection: { paddingHorizontal: 16, marginBottom: 16 },
  languageToggle: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 12, padding: 4 },
  langOption: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  langOptionActive: { backgroundColor: '#8B5CF6' },
  langText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  langTextActive: { color: 'white' },

  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', marginHorizontal: 16, paddingVertical: 16, borderRadius: 12, marginBottom: 16 },
  logoutButtonText: { fontSize: 16, fontWeight: '600', color: '#EF4444', marginLeft: 8 },

  version: { textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginBottom: 32 },
});

export default ProfileScreen;
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export const AdminPortalScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleTabPress = (tab: string) => {
    console.log('Tab pressed:', tab);
    setActiveTab(tab);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1F2937', '#111827']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>ProjeXtPal Admin</Text>
          <Text style={styles.subtitle}>Superadmin Dashboard</Text>
        </View>
        <View style={styles.adminBadge}>
          <Ionicons name="shield-checkmark" size={20} color="#F59E0B" />
        </View>
      </LinearGradient>

      {/* Tabs Bar */}
      <View style={styles.tabsBar}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'dashboard' && styles.tabButtonActive]} 
          onPress={() => handleTabPress('dashboard')}
        >
          <Ionicons name="speedometer" size={20} color={activeTab === 'dashboard' ? 'white' : '#6B7280'} />
          <Text style={[styles.tabButtonText, activeTab === 'dashboard' && styles.tabButtonTextActive]}>Dashboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'users' && styles.tabButtonActive]} 
          onPress={() => handleTabPress('users')}
        >
          <Ionicons name="people" size={20} color={activeTab === 'users' ? 'white' : '#6B7280'} />
          <Text style={[styles.tabButtonText, activeTab === 'users' && styles.tabButtonTextActive]}>Users</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'activity' && styles.tabButtonActive]} 
          onPress={() => handleTabPress('activity')}
        >
          <Ionicons name="time" size={20} color={activeTab === 'activity' ? 'white' : '#6B7280'} />
          <Text style={[styles.tabButtonText, activeTab === 'activity' && styles.tabButtonTextActive]}>Activity</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'system' && styles.tabButtonActive]} 
          onPress={() => handleTabPress('system')}
        >
          <Ionicons name="server" size={20} color={activeTab === 'system' ? 'white' : '#6B7280'} />
          <Text style={[styles.tabButtonText, activeTab === 'system' && styles.tabButtonTextActive]}>System</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ==================== DASHBOARD TAB ==================== */}
        {activeTab === 'dashboard' ? (
          <View style={styles.tabContent}>
            <Text style={styles.pageTitle}>📊 Dashboard Overview</Text>
            
            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <LinearGradient colors={['#8B5CF6', '#A855F7']} style={styles.statGradient}>
                  <Ionicons name="people" size={28} color="white" />
                </LinearGradient>
                <Text style={styles.statNumber}>6</Text>
                <Text style={styles.statLabel}>Totaal Gebruikers</Text>
                <Text style={styles.statChange}>+50% vs vorige maand</Text>
              </View>
              
              <View style={styles.statBox}>
                <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.statGradient}>
                  <Ionicons name="business" size={28} color="white" />
                </LinearGradient>
                <Text style={styles.statNumber}>3</Text>
                <Text style={styles.statLabel}>Organisaties</Text>
                <Text style={styles.statChange}>+200% vs vorige maand</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <LinearGradient colors={['#10B981', '#059669']} style={styles.statGradient}>
                  <Ionicons name="cash" size={28} color="white" />
                </LinearGradient>
                <Text style={styles.statNumber}>€350</Text>
                <Text style={styles.statLabel}>MRR</Text>
                <Text style={styles.statChange}>+35.3% vs vorige maand</Text>
              </View>
              
              <View style={styles.statBox}>
                <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.statGradient}>
                  <Ionicons name="card" size={28} color="white" />
                </LinearGradient>
                <Text style={styles.statNumber}>3</Text>
                <Text style={styles.statLabel}>Abonnementen</Text>
                <Text style={styles.statChange}>+4.1% vs vorige maand</Text>
              </View>
            </View>

            {/* Modules */}
            <Text style={styles.sectionTitle}>Admin Modules</Text>
            <View style={styles.modulesGrid}>
              {[
                { icon: 'people', title: 'Gebruikers', count: '6', colors: ['#8B5CF6', '#EC4899'] },
                { icon: 'business', title: 'Organisaties', count: '3', colors: ['#3B82F6', '#8B5CF6'] },
                { icon: 'git-branch', title: 'Integraties', count: '12', colors: ['#10B981', '#3B82F6'] },
                { icon: 'card', title: 'Abonnementen', count: '3', colors: ['#F59E0B', '#EC4899'] },
                { icon: 'school', title: 'Trainingen', count: '15', colors: ['#EC4899', '#F472B6'] },
                { icon: 'construct', title: 'Cursus Bouwer', count: '-', colors: ['#6366F1', '#8B5CF6'] },
              ].map((module, index) => (
                <TouchableOpacity key={index} style={styles.moduleCard}>
                  <LinearGradient colors={module.colors} style={styles.moduleGradient}>
                    <Ionicons name={module.icon as any} size={32} color="white" />
                  </LinearGradient>
                  <Text style={styles.moduleTitle}>{module.title}</Text>
                  {module.count !== '-' && (
                    <View style={styles.moduleCountBadge}>
                      <Text style={styles.moduleCountText}>{module.count}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

        {/* ==================== USERS TAB ==================== */}
        {activeTab === 'users' ? (
          <View style={styles.tabContent}>
            <Text style={styles.pageTitle}>👥 Gebruikers Beheer</Text>
            <Text style={styles.pageSubtitle}>Beheer alle gebruikers en hun toegang</Text>
            
            <TouchableOpacity style={styles.addNewButton}>
              <LinearGradient colors={['#8B5CF6', '#EC4899']} style={styles.addNewGradient}>
                <Ionicons name="person-add" size={20} color="white" />
                <Text style={styles.addNewText}>Nieuwe Gebruiker</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* User Cards */}
            {[
              { name: 'K. van de Kamp', email: 'kvandekamp@reciva.nl', role: 'house of digital', status: 'inactive' },
              { name: 'Khalid', email: 'khalid@re-care.org', role: 'recare', status: 'inactive' },
              { name: 'Reda', email: 'reda@inclufy.com', role: 'inclufy', status: 'active' },
              { name: 'Sami', email: 'sami@inclufy.com', role: 'inclufy (admin)', status: 'active' },
              { name: 'Salma Belahnichi', email: 'salma@inclufy.com', role: 'inclufy', status: 'active' },
            ].map((user, index) => (
              <View key={index} style={styles.userCardLarge}>
                <View style={styles.userCardHeader}>
                  <View style={styles.userAvatarLarge}>
                    <Text style={styles.userAvatarTextLarge}>{user.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.userCardInfo}>
                    <Text style={styles.userCardName}>{user.name}</Text>
                    <Text style={styles.userCardEmail}>{user.email}</Text>
                    <Text style={styles.userCardRole}>{user.role}</Text>
                  </View>
                  <View style={[styles.userStatusPill, user.status === 'active' ? styles.statusActive : styles.statusInactive]}>
                    <Text style={styles.statusPillText}>{user.status === 'active' ? 'Actief' : 'Inactief'}</Text>
                  </View>
                </View>
                <View style={styles.userCardActions}>
                  <TouchableOpacity style={styles.userActionButton}>
                    <Ionicons name="create" size={18} color="#8B5CF6" />
                    <Text style={styles.userActionText}>Bewerken</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.userActionButton}>
                    <Ionicons name="settings" size={18} color="#6B7280" />
                    <Text style={styles.userActionText}>Rechten</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {/* ==================== ACTIVITY TAB ==================== */}
        {activeTab === 'activity' ? (
          <View style={styles.tabContent}>
            <Text style={styles.pageTitle}>📝 Recente Activiteit</Text>
            <Text style={styles.pageSubtitle}>Laatste acties in het systeem</Text>
            
            {/* Activity Timeline */}
            <View style={styles.timeline}>
              {[
                { action: 'Updated company house of digital', user: 'K. van de Kamp', time: '12 jan 2025, 12:42', icon: 'create', color: '#3B82F6' },
                { action: 'Created company house of digital', user: 'K. van de Kamp', time: '12 jan 2025, 12:40', icon: 'add-circle', color: '#10B981' },
                { action: 'Updated company recare', user: 'Khalid', time: '12 jan 2025, 12:16', icon: 'create', color: '#3B82F6' },
                { action: 'Updated company recare', user: 'Khalid', time: '12 jan 2025, 12:12', icon: 'create', color: '#3B82F6' },
                { action: 'New user registered', user: 'Reda', time: '9 jan 2025, 10:19', icon: 'person-add', color: '#8B5CF6' },
                { action: 'Updated company recare', user: 'Khalid', time: '12 jan 2025, 12:01', icon: 'create', color: '#3B82F6' },
              ].map((activity, index) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineIconWrapper}>
                    <View style={[styles.timelineIcon, { backgroundColor: activity.color }]}>
                      <Ionicons name={activity.icon as any} size={16} color="white" />
                    </View>
                    {index < 5 && <View style={styles.timelineLine} />}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineAction}>{activity.action}</Text>
                    <View style={styles.timelineMeta}>
                      <Ionicons name="person" size={14} color="#6B7280" />
                      <Text style={styles.timelineUser}>{activity.user}</Text>
                      <Text style={styles.timelineTime}> • {activity.time}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* ==================== SYSTEM TAB ==================== */}
        {activeTab === 'system' ? (
          <View style={styles.tabContent}>
            <Text style={styles.pageTitle}>🖥️ Systeem Status</Text>
            
            <View style={styles.systemHealthBanner}>
              <Ionicons name="checkmark-circle" size={32} color="#10B981" />
              <View style={styles.systemHealthText}>
                <Text style={styles.systemHealthTitle}>Alle Systemen Operationeel</Text>
                <Text style={styles.systemHealthSubtitle}>Laatste check: 2 minuten geleden</Text>
              </View>
            </View>

            {/* System Services */}
            <Text style={styles.sectionTitle}>Services Status</Text>
            {[
              { name: 'API Server', uptime: '99.99%', status: 'operational' },
              { name: 'Database', uptime: '99.95%', status: 'operational' },
              { name: 'File Storage', uptime: '99.98%', status: 'operational' },
              { name: 'AI Services', uptime: '99.93%', status: 'operational' },
              { name: 'Email Service', uptime: '99.97%', status: 'operational' },
            ].map((service, index) => (
              <View key={index} style={styles.serviceCard}>
                <View style={styles.serviceHeader}>
                  <View style={styles.serviceLeft}>
                    <Ionicons name="server" size={20} color="#6B7280" />
                    <Text style={styles.serviceName}>{service.name}</Text>
                  </View>
                  <Text style={styles.serviceUptime}>{service.uptime}</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={styles.progressBarFill} />
                </View>
              </View>
            ))}

            {/* System Info */}
            <Text style={styles.sectionTitle}>Systeem Informatie</Text>
            <View style={styles.infoBox}>
              <View style={styles.infoItem}>
                <Ionicons name="information-circle" size={20} color="#6B7280" />
                <Text style={styles.infoLabel}>Versie</Text>
                <Text style={styles.infoValue}>v1.0.0</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="time" size={20} color="#6B7280" />
                <Text style={styles.infoLabel}>Last Backup</Text>
                <Text style={styles.infoValue}>2 hours ago</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="server" size={20} color="#6B7280" />
                <Text style={styles.infoLabel}>Storage</Text>
                <Text style={styles.infoValue}>45.6 / 100 GB</Text>
              </View>
            </View>
          </View>
        ) : null}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  backButton: { padding: 8, marginRight: 12 },
  headerInfo: { flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', color: 'white' },
  subtitle: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  adminBadge: { padding: 8 },
  
  tabsBar: { flexDirection: 'row', backgroundColor: 'white', paddingHorizontal: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', gap: 4 },
  tabButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, backgroundColor: '#F9FAFB', gap: 4 },
  tabButtonActive: { backgroundColor: '#1F2937' },
  tabButtonText: { fontSize: 11, fontWeight: '500', color: '#6B7280' },
  tabButtonTextActive: { color: 'white', fontWeight: '700' },
  
  scrollContent: { flex: 1 },
  tabContent: { padding: 20 },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  pageSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 20 },
  
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statBox: { flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  statGradient: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statNumber: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  statLabel: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  statChange: { fontSize: 11, color: '#10B981', fontWeight: '600' },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginTop: 24, marginBottom: 16 },
  
  modulesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  moduleCard: { width: '48%', backgroundColor: 'white', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, position: 'relative' },
  moduleGradient: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  moduleTitle: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  moduleCountBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  moduleCountText: { fontSize: 12, fontWeight: 'bold', color: '#1F2937' },
  
  addNewButton: { marginBottom: 16, borderRadius: 12, overflow: 'hidden', shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  addNewGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
  addNewText: { fontSize: 16, fontWeight: '600', color: 'white' },
  
  userCardLarge: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  userCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  userAvatarLarge: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#8B5CF6', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  userAvatarTextLarge: { fontSize: 22, fontWeight: 'bold', color: 'white' },
  userCardInfo: { flex: 1 },
  userCardName: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  userCardEmail: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  userCardRole: { fontSize: 12, color: '#8B5CF6', fontWeight: '600' },
  userStatusPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusActive: { backgroundColor: '#DCFCE7' },
  statusInactive: { backgroundColor: '#FEE2E2' },
  statusPillText: { fontSize: 11, fontWeight: '700', color: '#1F2937' },
  userCardActions: { flexDirection: 'row', gap: 12 },
  userActionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB', paddingVertical: 10, borderRadius: 10, gap: 6 },
  userActionText: { fontSize: 13, fontWeight: '600', color: '#1F2937' },
  
  timeline: { marginTop: 8 },
  timelineItem: { flexDirection: 'row', marginBottom: 20 },
  timelineIconWrapper: { alignItems: 'center', marginRight: 16 },
  timelineIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#E5E7EB', marginTop: 4 },
  timelineContent: { flex: 1, backgroundColor: 'white', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  timelineAction: { fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
  timelineMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timelineUser: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  timelineTime: { fontSize: 12, color: '#9CA3AF' },
  
  systemHealthBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DCFCE7', borderRadius: 16, padding: 20, marginBottom: 24, gap: 16 },
  systemHealthText: { flex: 1 },
  systemHealthTitle: { fontSize: 18, fontWeight: 'bold', color: '#16A34A', marginBottom: 4 },
  systemHealthSubtitle: { fontSize: 13, color: '#059669' },
  
  serviceCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  serviceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  serviceLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  serviceName: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  serviceUptime: { fontSize: 14, fontWeight: 'bold', color: '#10B981' },
  progressBarBg: { height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', width: '99%', backgroundColor: '#10B981', borderRadius: 4 },
  
  infoBox: { backgroundColor: 'white', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  infoItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', gap: 12 },
  infoLabel: { flex: 1, fontSize: 14, color: '#6B7280' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
});

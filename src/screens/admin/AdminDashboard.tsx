import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export const AdminDashboard: React.FC = () => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>📊 Dashboard Overview</Text>
      <Text style={styles.pageSubtitle}>Real-time statistieken en inzichten</Text>
      
      {/* Key Metrics */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <LinearGradient colors={['#8B5CF6', '#A855F7']} style={styles.metricIconBg}>
            <Ionicons name="people" size={32} color="white" />
          </LinearGradient>
          <View style={styles.metricInfo}>
            <Text style={styles.metricValue}>6</Text>
            <Text style={styles.metricLabel}>Totaal Gebruikers</Text>
            <View style={styles.changePositive}>
              <Ionicons name="trending-up" size={14} color="#10B981" />
              <Text style={styles.changeText}>+50% vs vorige maand</Text>
            </View>
          </View>
        </View>

        <View style={styles.metricCard}>
          <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.metricIconBg}>
            <Ionicons name="business" size={32} color="white" />
          </LinearGradient>
          <View style={styles.metricInfo}>
            <Text style={styles.metricValue}>3</Text>
            <Text style={styles.metricLabel}>Organisaties</Text>
            <View style={styles.changePositive}>
              <Ionicons name="trending-up" size={14} color="#10B981" />
              <Text style={styles.changeText}>+200% vs vorige maand</Text>
            </View>
          </View>
        </View>

        <View style={styles.metricCard}>
          <LinearGradient colors={['#10B981', '#059669']} style={styles.metricIconBg}>
            <Ionicons name="cash" size={32} color="white" />
          </LinearGradient>
          <View style={styles.metricInfo}>
            <Text style={styles.metricValue}>€350</Text>
            <Text style={styles.metricLabel}>Monthly Recurring Revenue</Text>
            <View style={styles.changePositive}>
              <Ionicons name="trending-up" size={14} color="#10B981" />
              <Text style={styles.changeText}>+35.3% vs vorige maand</Text>
            </View>
          </View>
        </View>

        <View style={styles.metricCard}>
          <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.metricIconBg}>
            <Ionicons name="card" size={32} color="white" />
          </LinearGradient>
          <View style={styles.metricInfo}>
            <Text style={styles.metricValue}>3</Text>
            <Text style={styles.metricLabel}>Actieve Abonnementen</Text>
            <View style={styles.changePositive}>
              <Ionicons name="trending-up" size={14} color="#10B981" />
              <Text style={styles.changeText}>+4.1% vs vorige maand</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity style={styles.quickActionCard}>
          <LinearGradient colors={['#8B5CF6', '#EC4899']} style={styles.quickActionGradient}>
            <Ionicons name="person-add" size={28} color="white" />
            <Text style={styles.quickActionText}>Nieuwe Gebruiker</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickActionCard}>
          <LinearGradient colors={['#3B82F6', '#8B5CF6']} style={styles.quickActionGradient}>
            <Ionicons name="business" size={28} color="white" />
            <Text style={styles.quickActionText}>Nieuwe Organisatie</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickActionCard}>
          <LinearGradient colors={['#10B981', '#3B82F6']} style={styles.quickActionGradient}>
            <Ionicons name="document-text" size={28} color="white" />
            <Text style={styles.quickActionText}>Genereer Rapport</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickActionCard}>
          <LinearGradient colors={['#F59E0B', '#EC4899']} style={styles.quickActionGradient}>
            <Ionicons name="settings" size={28} color="white" />
            <Text style={styles.quickActionText}>Systeem Config</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Admin Modules */}
      <Text style={styles.sectionTitle}>🎯 Admin Modules</Text>
      <View style={styles.modulesGrid}>
        {[
          { icon: 'people', title: 'Gebruikers', subtitle: 'Beheer alle gebruikers', count: '6', colors: ['#8B5CF6', '#EC4899'] },
          { icon: 'business', title: 'Organisaties', subtitle: 'Beheer organisaties', count: '3', colors: ['#3B82F6', '#8B5CF6'] },
          { icon: 'git-branch', title: 'Integraties', subtitle: 'API & webhooks', count: '12', colors: ['#10B981', '#3B82F6'] },
          { icon: 'card', title: 'Abonnementen', subtitle: 'Beheer abonnementen', count: '3', colors: ['#F59E0B', '#EC4899'] },
          { icon: 'school', title: 'Trainingen', subtitle: 'Cursus management', count: '15', colors: ['#EC4899', '#F472B6'] },
          { icon: 'construct', title: 'Cursus Bouwer', subtitle: 'Content creator', count: '∞', colors: ['#6366F1', '#8B5CF6'] },
          { icon: 'document-text', title: 'Facturen', subtitle: 'Facturatie beheer', count: '24', colors: ['#14B8A6', '#06B6D4'] },
          { icon: 'settings', title: 'Instellingen', subtitle: 'Systeem configuratie', count: '-', colors: ['#6B7280', '#4B5563'] },
        ].map((module, index) => (
          <TouchableOpacity key={index} style={styles.moduleCard}>
            <LinearGradient colors={module.colors} style={styles.moduleIcon}>
              <Ionicons name={module.icon as any} size={28} color="white" />
            </LinearGradient>
            <View style={styles.moduleContent}>
              <View style={styles.moduleHeader}>
                <Text style={styles.moduleTitle}>{module.title}</Text>
                {module.count !== '-' && (
                  <View style={styles.moduleBadge}>
                    <Text style={styles.moduleBadgeText}>{module.count}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.moduleSubtitle}>{module.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Activity Preview */}
      <Text style={styles.sectionTitle}>📋 Recente Activiteit</Text>
      <View style={styles.activityPreview}>
        {[
          { action: 'Updated company house of digital', user: 'K. van de Kamp', time: '2 min geleden', icon: 'create', color: '#3B82F6' },
          { action: 'New user registered', user: 'Reda', time: '15 min geleden', icon: 'person-add', color: '#10B981' },
          { action: 'Subscription renewed', user: 'Inclufy', time: '1 uur geleden', icon: 'card', color: '#F59E0B' },
        ].map((activity, index) => (
          <View key={index} style={styles.activityPreviewItem}>
            <View style={[styles.activityIconSmall, { backgroundColor: activity.color }]}>
              <Ionicons name={activity.icon as any} size={16} color="white" />
            </View>
            <View style={styles.activityPreviewContent}>
              <Text style={styles.activityPreviewAction}>{activity.action}</Text>
              <Text style={styles.activityPreviewMeta}>{activity.user} • {activity.time}</Text>
            </View>
          </View>
        ))}
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>Bekijk alle activiteit</Text>
          <Ionicons name="arrow-forward" size={16} color="#8B5CF6" />
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  pageSubtitle: { fontSize: 15, color: '#6B7280', marginBottom: 24 },
  
  metricsGrid: { gap: 16, marginBottom: 24 },
  metricCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  metricIconBg: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  metricInfo: { flex: 1 },
  metricValue: { fontSize: 32, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  metricLabel: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  changePositive: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  changeText: { fontSize: 12, color: '#10B981', fontWeight: '600' },
  
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginTop: 8, marginBottom: 16 },
  
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  quickActionCard: { width: '48%', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  quickActionGradient: { padding: 20, alignItems: 'center', gap: 12 },
  quickActionText: { fontSize: 13, fontWeight: '600', color: 'white', textAlign: 'center' },
  
  modulesGrid: { gap: 12, marginBottom: 24 },
  moduleCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3 },
  moduleIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  moduleContent: { flex: 1 },
  moduleHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  moduleTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  moduleBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  moduleBadgeText: { fontSize: 12, fontWeight: 'bold', color: '#1F2937' },
  moduleSubtitle: { fontSize: 12, color: '#6B7280' },
  
  activityPreview: { backgroundColor: 'white', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3 },
  activityPreviewItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  activityIconSmall: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  activityPreviewContent: { flex: 1 },
  activityPreviewAction: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  activityPreviewMeta: { fontSize: 12, color: '#6B7280' },
  viewAllButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, gap: 8 },
  viewAllText: { fontSize: 14, fontWeight: '600', color: '#8B5CF6' },
});

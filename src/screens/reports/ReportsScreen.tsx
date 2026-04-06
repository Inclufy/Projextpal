import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { projectsService } from '../../services/projects';
import { programsService } from '../../services/programs';
import { timeTrackingService } from '../../services/timeTrackingService';

export const ReportsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalPrograms: 0,
    totalHours: 0,
    approvedHours: 0,
    pendingHours: 0,
  });

  const getLocale = () => i18n.language === 'nl' ? 'nl-NL' : 'en-US';

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      const [projects, programs, timeEntries] = await Promise.all([
        projectsService.getProjects(),
        programsService.getPrograms(),
        timeTrackingService.getTimeEntries(),
      ]);

      const activeProjects = projects.filter(p => 
        p.status === 'active' || p.status === 'in_progress'
      ).length;
      
      const completedProjects = projects.filter(p => 
        p.status === 'completed'
      ).length;

      const totalHours = timeEntries.reduce((sum, e) => sum + (e.hours || 0), 0);
      const approvedHours = timeEntries
        .filter(e => e.status === 'approved')
        .reduce((sum, e) => sum + (e.hours || 0), 0);
      const pendingHours = timeEntries
        .filter(e => e.status === 'pending' || e.status === 'submitted' || e.status === 'draft')
        .reduce((sum, e) => sum + (e.hours || 0), 0);

      setStats({
        totalProjects: projects.length,
        activeProjects,
        completedProjects,
        totalPrograms: programs.length,
        totalHours,
        approvedHours,
        pendingHours,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const reportCards = [
    {
      title: 'Project Overzicht',
      icon: 'folder',
      color: '#3B82F6',
      stats: [
        { label: 'Totaal', value: stats.totalProjects },
        { label: 'Actief', value: stats.activeProjects },
        { label: 'Voltooid', value: stats.completedProjects },
      ],
    },
    {
      title: 'Programma\'s',
      icon: 'briefcase',
      color: '#8B5CF6',
      stats: [
        { label: 'Totaal', value: stats.totalPrograms },
        { label: 'Actief', value: stats.totalPrograms },
      ],
    },
    {
      title: 'Uren Registratie',
      icon: 'time',
      color: '#10B981',
      stats: [
        { label: 'Totaal', value: `${stats.totalHours}u` },
        { label: 'Goedgekeurd', value: `${stats.approvedHours}u` },
        { label: 'In afwachting', value: `${stats.pendingHours}u` },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#3B82F6', '#8B5CF6']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Rapportages</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadStats}>
          <Ionicons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Overzicht</Text>
          
          {reportCards.map((card, index) => (
            <View key={index} style={styles.reportCard}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, { backgroundColor: `${card.color}15` }]}>
                  <Ionicons name={card.icon as any} size={24} color={card.color} />
                </View>
                <Text style={styles.cardTitle}>{card.title}</Text>
              </View>
              
              <View style={styles.statsGrid}>
                {card.stats.map((stat, idx) => (
                  <View key={idx} style={styles.statItem}>
                    <Text style={[styles.statValue, { color: card.color }]}>
                      {stat.value}
                    </Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}

          <View style={styles.comingSoonCard}>
            <Ionicons name="bar-chart-outline" size={48} color="#D1D5DB" />
            <Text style={styles.comingSoonTitle}>Meer rapportages komen eraan</Text>
            <Text style={styles.comingSoonText}>
              Binnenkort kunt u gedetailleerde rapporten exporteren, grafieken bekijken en aangepaste analyses maken.
            </Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  backButton: { padding: 8 },
  title: { flex: 1, fontSize: 24, fontWeight: 'bold', color: 'white', textAlign: 'center' },
  refreshButton: { padding: 8 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 },
  
  reportCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  
  comingSoonCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 12,
  },
  comingSoonText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

export const AcademyScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState('all');

  const courses = [
    { id: '1', title: 'PRINCE2 Foundation', duration: '40u', level: 'Beginner', price: 'Gratis', progress: 0, icon: 'shield-checkmark', gradient: ['#8B5CF6', '#A855F7'] },
    { id: '2', title: 'Agile & Scrum Mastery', duration: '32u', level: 'Intermediate', price: 'Gratis', progress: 0, icon: 'flash', gradient: ['#3B82F6', '#2563EB'] },
    { id: '3', title: 'Project Management Fundamentals', duration: '25u', level: 'Beginner', price: 'Gratis', progress: 0, icon: 'bar-chart', gradient: ['#10B981', '#059669'] },
    { id: '4', title: 'Leadership & Team Management', duration: '30u', level: 'Advanced', price: 'Gratis', progress: 0, icon: 'people', gradient: ['#F59E0B', '#D97706'] },
    { id: '5', title: 'Risk Management Professional', duration: '28u', level: 'Intermediate', price: 'Gratis', progress: 0, icon: 'shield', gradient: ['#EC4899', '#F472B6'] },
    { id: '6', title: 'Budget & Financial Planning', duration: '22u', level: 'Intermediate', price: 'Gratis', progress: 0, icon: 'wallet', gradient: ['#14B8A6', '#06B6D4'] },
  ];

  const tabs = [
    { id: 'all', name: 'Alles', icon: 'grid' },
    { id: 'ongoing', name: 'Bezig', icon: 'play-circle' },
    { id: 'completed', name: 'Voltooid', icon: 'checkmark-circle' },
    { id: 'saved', name: 'Opgeslagen', icon: 'bookmark' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#8B5CF6', '#EC4899']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Academy</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {tabs.map((tab) => (
            <TouchableOpacity key={tab.id} style={[styles.tab, selectedTab === tab.id && styles.tabActive]} onPress={() => setSelectedTab(tab.id)}>
              <Ionicons name={tab.icon as any} size={18} color={selectedTab === tab.id ? 'white' : '#6B7280'} />
              <Text style={[styles.tabText, selectedTab === tab.id && styles.tabTextActive]}>{tab.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Featured Banner */}
        <View style={styles.featuredBanner}>
          <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.bannerGradient}>
            <Text style={styles.bannerBadge}>✨ NIEUW</Text>
            <Text style={styles.bannerTitle}>Gratis Certificering</Text>
            <Text style={styles.bannerSubtitle}>Start vandaag met PRINCE2 Foundation</Text>
            <TouchableOpacity style={styles.bannerButton}>
              <Text style={styles.bannerButtonText}>Start Nu →</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <LinearGradient colors={['#8B5CF6', '#A855F7']} style={styles.statIconGradient}>
              <Ionicons name="book" size={24} color="white" />
            </LinearGradient>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Cursussen</Text>
          </View>
          <View style={styles.statBox}>
            <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.statIconGradient}>
              <Ionicons name="trophy" size={24} color="white" />
            </LinearGradient>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Certificaten</Text>
          </View>
          <View style={styles.statBox}>
            <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.statIconGradient}>
              <Ionicons name="time" size={24} color="white" />
            </LinearGradient>
            <Text style={styles.statNumber}>48u</Text>
            <Text style={styles.statLabel}>Geleerd</Text>
          </View>
        </View>

        {/* Courses Grid - LUXE GRADIENT ICONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Beschikbare Cursussen</Text>
          {courses.map((course) => (
            <TouchableOpacity key={course.id} style={styles.courseCard}>
              <LinearGradient 
                colors={course.gradient} 
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.courseImageGradient}
              >
                <View style={styles.courseIconContainer}>
                  <Ionicons name={course.icon as any} size={36} color="white" />
                </View>
              </LinearGradient>
              <View style={styles.courseInfo}>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <View style={styles.courseMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color="#6B7280" />
                    <Text style={styles.metaText}>{course.duration}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="bar-chart-outline" size={14} color="#6B7280" />
                    <Text style={styles.metaText}>{course.level}</Text>
                  </View>
                </View>
                <View style={styles.coursePriceRow}>
                  <View style={styles.priceTag}>
                    <Text style={styles.priceText}>{course.price}</Text>
                  </View>
                  <TouchableOpacity style={styles.startButton}>
                    <Text style={styles.startButtonText}>Start →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  backButton: { padding: 8 },
  title: { flex: 1, fontSize: 24, fontWeight: 'bold', color: 'white', textAlign: 'center' },
  searchButton: { padding: 8 },
  
  tabsContainer: { backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tabs: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  tab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F9FAFB', gap: 6 },
  tabActive: { backgroundColor: '#8B5CF6' },
  tabText: { fontSize: 14, fontWeight: '500', color: '#6B7280' },
  tabTextActive: { color: 'white' },
  
  content: { flex: 1 },
  
  featuredBanner: { marginHorizontal: 20, marginTop: 20, borderRadius: 16, overflow: 'hidden', shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  bannerGradient: { padding: 24 },
  bannerBadge: { fontSize: 12, fontWeight: 'bold', color: 'white', backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 8 },
  bannerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 4 },
  bannerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginBottom: 16 },
  bannerButton: { backgroundColor: 'white', alignSelf: 'flex-start', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  bannerButtonText: { fontSize: 14, fontWeight: 'bold', color: '#8B5CF6' },
  
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 20, gap: 12 },
  statBox: { flex: 1, backgroundColor: 'white', borderRadius: 12, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  statIconGradient: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginTop: 4 },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 },
  
  courseCard: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  courseImageGradient: { 
    width: 80, 
    height: 80, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 16, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    elevation: 8 
  },
  courseIconContainer: { 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    backgroundColor: 'rgba(255,255,255,0.25)', 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  courseInfo: { flex: 1 },
  courseTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
  courseMeta: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#6B7280' },
  coursePriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceTag: { backgroundColor: '#DCFCE7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  priceText: { fontSize: 12, fontWeight: 'bold', color: '#16A34A' },
  startButton: { paddingHorizontal: 16, paddingVertical: 8 },
  startButtonText: { fontSize: 14, fontWeight: '600', color: '#8B5CF6' },
});

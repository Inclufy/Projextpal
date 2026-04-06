import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export const AboutScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#3B82F6', '#8B5CF6']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Over ProjeXtPal</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.logoCard}>
          <Ionicons name="rocket" size={64} color="#8B5CF6" />
          <Text style={styles.appName}>ProjeXtPal</Text>
          <Text style={styles.tagline}>Project Management Excellence</Text>
          <Text style={styles.version}>Versie 1.0.0</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Over deze app</Text>
          <Text style={styles.description}>
            ProjeXtPal is een krachtig projectmanagementplatform dat teams helpt om efficiënter samen te werken, projecten beter te organiseren en deadlines te halen.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Ontwikkeld door</Text>
          <Text style={styles.description}>Inclufy</Text>
          <Text style={styles.description}>© 2026 Alle rechten voorbehouden</Text>
        </View>

        <View style={styles.linksCard}>
          <TouchableOpacity style={styles.linkItem}>
            <Ionicons name="document-text-outline" size={20} color="#3B82F6" />
            <Text style={styles.linkText}>Privacybeleid</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.linkItem}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#3B82F6" />
            <Text style={styles.linkText}>Gebruiksvoorwaarden</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.linkItem}
            onPress={() => Linking.openURL('https://inclufy.com')}
          >
            <Ionicons name="globe-outline" size={20} color="#3B82F6" />
            <Text style={styles.linkText}>Website bezoeken</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  backButton: { padding: 8 },
  title: { flex: 1, fontSize: 24, fontWeight: 'bold', color: 'white', textAlign: 'center' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  
  logoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
  },
  tagline: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  version: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
  
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  
  linksCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  linkText: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export const SupportScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();

  const handleEmail = () => {
    Linking.openURL('mailto:support@projextpal.com');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#3B82F6', '#8B5CF6']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Help & Ondersteuning</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.placeholderCard}>
          <Ionicons name="help-circle-outline" size={64} color="#D1D5DB" />
          <Text style={styles.placeholderTitle}>Help & Ondersteuning</Text>
          <Text style={styles.placeholderText}>
            Heeft u vragen of hulp nodig? Ons ondersteuningsteam staat voor u klaar.
          </Text>
          
          <TouchableOpacity style={styles.contactButton} onPress={handleEmail}>
            <LinearGradient colors={['#3B82F6', '#8B5CF6']} style={styles.buttonGradient}>
              <Ionicons name="mail-outline" size={20} color="white" />
              <Text style={styles.buttonText}>Contact opnemen</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Veelgestelde vragen</Text>
          <Text style={styles.infoText}>
            Bezoek onze kennisbank voor antwoorden op veelgestelde vragen over ProjeXtPal.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  backButton: { padding: 8 },
  title: { flex: 1, fontSize: 20, fontWeight: 'bold', color: 'white', textAlign: 'center' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  placeholderCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  contactButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});

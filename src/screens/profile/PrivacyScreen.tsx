import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';

export const PrivacyScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isNL } = useLanguage();

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#3B82F6', '#8B5CF6']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>{isNL ? 'Privacy & Beveiliging' : 'Privacy & Security'}</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentColumn}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="shield-checkmark-outline" size={22} color="#2563EB" />
              <Text style={styles.cardTitle}>{isNL ? 'Jouw gegevens' : 'Your data'}</Text>
            </View>
            <Text style={styles.cardText}>
              {isNL
                ? 'ProjeXtPal verwerkt je gegevens volgens de AVG. Je hebt recht op inzage (art. 15) en op verwijdering (art. 17) van je persoonsgegevens.'
                : 'ProjeXtPal processes your data in accordance with the GDPR. You have the right of access (Art. 15) and the right to erasure (Art. 17) of your personal data.'}
            </Text>
          </View>

          <View style={styles.card}>
            <TouchableOpacity
              style={styles.row}
              onPress={() => navigation.navigate('DeleteAccount')}
              activeOpacity={0.7}
            >
              <View style={[styles.rowIcon, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="download-outline" size={20} color="#2563EB" />
              </View>
              <View style={styles.rowTextWrap}>
                <Text style={styles.rowLabel}>
                  {isNL ? 'Download mijn gegevens' : 'Download my data'}
                </Text>
                <Text style={styles.rowSub}>
                  {isNL ? 'Kopie van al je gegevens (AVG art. 15)' : 'Copy of all your data (GDPR Art. 15)'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.row}
              onPress={() => navigation.navigate('DeleteAccount')}
              activeOpacity={0.7}
            >
              <View style={[styles.rowIcon, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="trash-outline" size={20} color="#DC2626" />
              </View>
              <View style={styles.rowTextWrap}>
                <Text style={[styles.rowLabel, { color: '#DC2626' }]}>
                  {isNL ? 'Account verwijderen' : 'Delete account'}
                </Text>
                <Text style={styles.rowSub}>
                  {isNL ? 'Permanent je account en gegevens wissen' : 'Permanently erase your account and data'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
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
  content: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  contentColumn: { width: '100%', maxWidth: 600, alignSelf: 'center' },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginLeft: 8 },
  cardText: { fontSize: 15, color: '#4B5563', lineHeight: 22 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowTextWrap: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  rowSub: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 8 },
});

export default PrivacyScreen;

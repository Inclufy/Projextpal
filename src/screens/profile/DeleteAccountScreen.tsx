import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Share,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuthStore } from '../../store/authStore';
import { apiService } from '../../services/apiService';
import { API_CONFIG } from '../../services/api';

// App Review Guideline 5.1.1(v): in-app account deletion.
// Backend contract: DELETE /api/v1/auth/me/delete/ (GDPR Art. 17,
// backend/accounts/gdpr.py) — anonymizes PII, deactivates the account and
// returns a 30-day grace period before the final hard-delete.
const CONFIRM_WORD = 'DELETE';

export const DeleteAccountScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isNL } = useLanguage();
  const { user, logout } = useAuthStore();
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const consequences = isNL
    ? [
        'Je persoonsgegevens (naam, e-mailadres, profielfoto) worden direct en permanent geanonimiseerd.',
        'Je account wordt gedeactiveerd — je kunt niet meer inloggen.',
        'Na een herstelperiode van 30 dagen worden je gegevens definitief verwijderd.',
        'Binnen die 30 dagen kun je via support@inclufy.com herstel aanvragen.',
        'Projectdata van je organisatie blijft bestaan, maar is niet meer aan jou gekoppeld.',
      ]
    : [
        'Your personal data (name, email address, profile photo) is anonymized immediately and permanently.',
        'Your account is deactivated — you will no longer be able to sign in.',
        'After a 30-day grace period your data is permanently deleted.',
        'Within those 30 days you can request recovery via support@inclufy.com.',
        'Your organization’s project data remains, but is no longer linked to you.',
      ];

  const handleExportData = async () => {
    try {
      setExporting(true);
      const data = await apiService.get<object>(API_CONFIG.ENDPOINTS.DATA_EXPORT);
      await Share.share({
        title: 'ProjeXtPal data export (GDPR Art. 15)',
        message: JSON.stringify(data, null, 2),
      });
    } catch (error: any) {
      Alert.alert(
        isNL ? 'Export mislukt' : 'Export failed',
        error?.message ||
          (isNL ? 'Kon je gegevens niet ophalen. Probeer het opnieuw.' : 'Could not fetch your data. Please try again.')
      );
    } finally {
      setExporting(false);
    }
  };

  const performDelete = async () => {
    try {
      setDeleting(true);
      const response = await apiService.delete<{ grace_period_until?: string }>(
        API_CONFIG.ENDPOINTS.DELETE_ACCOUNT
      );
      const graceDate = response?.grace_period_until
        ? new Date(response.grace_period_until).toLocaleDateString(isNL ? 'nl-NL' : 'en-US')
        : null;
      Alert.alert(
        isNL ? 'Account verwijderd' : 'Account deleted',
        isNL
          ? `Je gegevens zijn geanonimiseerd en je account is gedeactiveerd.${graceDate ? ` Definitieve verwijdering na ${graceDate}.` : ''} Je wordt nu uitgelogd.`
          : `Your data has been anonymized and your account deactivated.${graceDate ? ` Final deletion after ${graceDate}.` : ''} You will now be signed out.`,
        [{ text: 'OK', onPress: () => logout() }],
        { cancelable: false }
      );
    } catch (error: any) {
      setDeleting(false);
      Alert.alert(
        isNL ? 'Verwijderen mislukt' : 'Deletion failed',
        error?.message ||
          (isNL ? 'Er is iets misgegaan. Probeer het opnieuw.' : 'Something went wrong. Please try again.')
      );
    }
  };

  const handleDeletePress = () => {
    Alert.alert(
      isNL ? 'Account definitief verwijderen?' : 'Permanently delete account?',
      isNL
        ? `Dit verwijdert het account ${user?.email ?? ''} en kan na 30 dagen niet meer ongedaan worden gemaakt.`
        : `This deletes the account ${user?.email ?? ''} and cannot be undone after 30 days.`,
      [
        { text: isNL ? 'Annuleren' : 'Cancel', style: 'cancel' },
        {
          text: isNL ? 'Verwijder mijn account' : 'Delete my account',
          style: 'destructive',
          onPress: performDelete,
        },
      ]
    );
  };

  const confirmed = confirmText.trim().toUpperCase() === CONFIRM_WORD;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#EF4444', '#B91C1C']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>{isNL ? 'Account verwijderen' : 'Delete Account'}</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.contentColumn}>
            <View style={styles.warningCard}>
              <Ionicons name="warning-outline" size={40} color="#B91C1C" />
              <Text style={styles.warningTitle}>
                {isNL ? 'Dit betekent verwijderen' : 'What deletion means'}
              </Text>
              {consequences.map((line, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>{'•'}</Text>
                  <Text style={styles.bulletText}>{line}</Text>
                </View>
              ))}
            </View>

            <View style={styles.exportCard}>
              <View style={styles.exportHeader}>
                <Ionicons name="download-outline" size={22} color="#2563EB" />
                <Text style={styles.exportTitle}>
                  {isNL ? 'Eerst je gegevens downloaden?' : 'Download your data first?'}
                </Text>
              </View>
              <Text style={styles.exportText}>
                {isNL
                  ? 'Je kunt vóór verwijdering een kopie van al je gegevens opvragen (AVG art. 15).'
                  : 'Before deleting, you can request a copy of all your data (GDPR Art. 15).'}
              </Text>
              <TouchableOpacity
                style={styles.exportButton}
                onPress={handleExportData}
                disabled={exporting || deleting}
              >
                {exporting ? (
                  <ActivityIndicator size="small" color="#2563EB" />
                ) : (
                  <Text style={styles.exportButtonText}>
                    {isNL ? 'Download mijn gegevens' : 'Download my data'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.confirmCard}>
              <Text style={styles.confirmLabel}>
                {isNL
                  ? `Typ ${CONFIRM_WORD} om te bevestigen`
                  : `Type ${CONFIRM_WORD} to confirm`}
              </Text>
              <TextInput
                style={styles.confirmInput}
                value={confirmText}
                onChangeText={setConfirmText}
                placeholder={CONFIRM_WORD}
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!deleting}
              />
              <TouchableOpacity
                style={[styles.deleteButton, (!confirmed || deleting) && styles.deleteButtonDisabled]}
                onPress={handleDeletePress}
                disabled={!confirmed || deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="trash-outline" size={20} color="white" />
                    <Text style={styles.deleteButtonText}>
                      {isNL ? 'Verwijder mijn account definitief' : 'Permanently delete my account'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
                disabled={deleting}
              >
                <Text style={styles.cancelButtonText}>{isNL ? 'Annuleren' : 'Cancel'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: { padding: 8 },
  title: { flex: 1, fontSize: 20, fontWeight: 'bold', color: 'white', textAlign: 'center' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  // Cap line length on tablets (iPad Air 11") so text stays readable.
  contentColumn: { width: '100%', maxWidth: 600, alignSelf: 'center' },
  warningCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#991B1B',
    marginTop: 8,
    marginBottom: 12,
  },
  bulletRow: { flexDirection: 'row', alignSelf: 'stretch', marginBottom: 8 },
  bulletDot: { fontSize: 15, color: '#991B1B', marginRight: 8, lineHeight: 22 },
  bulletText: { flex: 1, fontSize: 15, color: '#7F1D1D', lineHeight: 22 },
  exportCard: {
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
  exportHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  exportTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginLeft: 8 },
  exportText: { fontSize: 14, color: '#4B5563', lineHeight: 21, marginBottom: 12 },
  exportButton: {
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  exportButtonText: { fontSize: 15, fontWeight: '600', color: '#2563EB' },
  confirmCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  confirmLabel: { fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
  confirmInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    marginBottom: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 8,
  },
  deleteButtonDisabled: { backgroundColor: '#FCA5A5' },
  deleteButtonText: { fontSize: 15, fontWeight: '700', color: 'white', marginLeft: 8 },
  cancelButton: { alignItems: 'center', paddingVertical: 12 },
  cancelButtonText: { fontSize: 15, fontWeight: '600', color: '#4B5563' },
});

export default DeleteAccountScreen;

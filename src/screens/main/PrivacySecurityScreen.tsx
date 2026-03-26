import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { WebView } from 'react-native-webview';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface TwoFAStatus {
  enabled: boolean;
  provisioning_uri?: string;
}

type ActiveModal =
  | null
  | 'setup2fa'
  | 'disable2fa'
  | 'changePassword'
  | 'deleteAccount'
  | 'exportData';

// ─── QR Code renderer using a minimal inline HTML page via WebView ────────────

function QRCodeWebView({ uri }: { uri: string }) {
  // We embed a tiny QR library via CDN in an inline HTML page
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no"/>
  <style>
    body { margin:0; background:#1F2037; display:flex; justify-content:center; align-items:center; height:100vh; }
    canvas { border-radius: 8px; }
  </style>
</head>
<body>
  <canvas id="qr"></canvas>
  <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
  <script>
    QRCode.toCanvas(document.getElementById('qr'), ${JSON.stringify(uri)}, {
      width: 200, margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' }
    });
  </script>
</body>
</html>`;

  return (
    <WebView
      source={{ html }}
      style={styles.qrWebView}
      scrollEnabled={false}
      originWhitelist={['*']}
      javaScriptEnabled
    />
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ icon, title }: { icon: keyof typeof Ionicons.glyphMap; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={16} color="#A78BFA" />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

// ─── Row item ─────────────────────────────────────────────────────────────────

function SettingRow({
  icon,
  label,
  subtitle,
  onPress,
  rightElement,
  destructive,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress && !rightElement}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.settingIconWrap, destructive && styles.settingIconWrapDestructive]}>
          <Ionicons name={icon} size={18} color={destructive ? '#EF4444' : '#A78BFA'} />
        </View>
        <View style={styles.settingTextWrap}>
          <Text style={[styles.settingLabel, destructive && styles.settingLabelDestructive]}>
            {label}
          </Text>
          {subtitle ? <Text style={styles.settingSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {rightElement ?? (onPress ? (
        <Ionicons name="chevron-forward" size={18} color="#4B5563" />
      ) : null)}
    </TouchableOpacity>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function PrivacySecurityScreen({ navigation }: any) {
  const { logout } = useAuth();

  // 2FA state
  const [twoFAStatus, setTwoFAStatus] = useState<TwoFAStatus | null>(null);
  const [twoFALoading, setTwoFALoading] = useState(true);

  // Biometric state
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricToggling, setBiometricToggling] = useState(false);

  // Active modal
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  // Modal-local state
  const [totp, setTotp] = useState('');
  const [setupUri, setSetupUri] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupStep, setSetupStep] = useState<'qr' | 'verify'>('qr');
  const [disableCode, setDisableCode] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'loading' | 'ready'>('idle');
  const [exportUrl, setExportUrl] = useState('');
  const [modalError, setModalError] = useState('');

  // ── Load initial state ──────────────────────────────────────────────────────

  const load2FAStatus = useCallback(async () => {
    try {
      const res = await api.get('/auth/2fa/setup/');
      setTwoFAStatus(res.data);
    } catch {
      setTwoFAStatus({ enabled: false });
    } finally {
      setTwoFALoading(false);
    }
  }, []);

  const loadBiometricStatus = useCallback(async () => {
    // Check if device supports biometrics by looking at stored preference first
    // expo-local-authentication is not yet installed; we check SecureStore preference
    // and mark as available on iOS/Android (graceful approach)
    const pref = await SecureStore.getItemAsync('biometric_enabled');
    setBiometricEnabled(pref === 'true');
    // On physical devices biometrics are generally available; web/simulator won't have it
    setBiometricAvailable(Platform.OS === 'ios' || Platform.OS === 'android');
  }, []);

  useEffect(() => {
    load2FAStatus();
    loadBiometricStatus();
  }, [load2FAStatus, loadBiometricStatus]);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function openModal(modal: ActiveModal) {
    setModalError('');
    setTotp('');
    setDisableCode('');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setDeletePassword('');
    setDeleteConfirmed(false);
    setExportStatus('idle');
    setExportUrl('');
    setSetupStep('qr');
    setActiveModal(modal);
  }

  function closeModal() {
    setActiveModal(null);
  }

  // ── 2FA Setup ────────────────────────────────────────────────────────────────

  async function handle2FASetupOpen() {
    openModal('setup2fa');
    setSetupLoading(true);
    try {
      const res = await api.post('/auth/2fa/setup/');
      setSetupUri(res.data.provisioning_uri || '');
      setSetupStep('qr');
    } catch (err: any) {
      setModalError(err.response?.data?.error || 'Kon 2FA setup niet starten');
    } finally {
      setSetupLoading(false);
    }
  }

  async function handle2FAVerifySetup() {
    if (totp.length !== 6) {
      setModalError('Voer een 6-cijferige code in');
      return;
    }
    setSetupLoading(true);
    setModalError('');
    try {
      await api.post('/auth/2fa/verify-setup/', { code: totp });
      setTwoFAStatus({ enabled: true });
      closeModal();
      Alert.alert('2FA Ingeschakeld', 'Twee-factor authenticatie is nu actief op je account.');
    } catch (err: any) {
      setModalError(err.response?.data?.error || 'Ongeldige code. Probeer opnieuw.');
    } finally {
      setSetupLoading(false);
    }
  }

  // ── 2FA Disable ───────────────────────────────────────────────────────────────

  async function handle2FADisable() {
    if (disableCode.length !== 6) {
      setModalError('Voer een 6-cijferige code in');
      return;
    }
    setSetupLoading(true);
    setModalError('');
    try {
      await api.post('/auth/2fa/disable/', { code: disableCode });
      setTwoFAStatus({ enabled: false });
      closeModal();
      Alert.alert('2FA Uitgeschakeld', 'Twee-factor authenticatie is uitgeschakeld.');
    } catch (err: any) {
      setModalError(err.response?.data?.error || 'Ongeldige code. Probeer opnieuw.');
    } finally {
      setSetupLoading(false);
    }
  }

  // ── Biometric toggle ──────────────────────────────────────────────────────────

  async function handleBiometricToggle(value: boolean) {
    if (!biometricAvailable) {
      Alert.alert('Niet beschikbaar', 'Biometrische authenticatie is niet beschikbaar op dit apparaat.');
      return;
    }
    setBiometricToggling(true);
    try {
      await SecureStore.setItemAsync('biometric_enabled', value ? 'true' : 'false');
      setBiometricEnabled(value);
    } finally {
      setBiometricToggling(false);
    }
  }

  // ── Password change ───────────────────────────────────────────────────────────

  async function handlePasswordChange() {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setModalError('Vul alle velden in');
      return;
    }
    if (newPassword.length < 8) {
      setModalError('Nieuw wachtwoord moet minimaal 8 tekens bevatten');
      return;
    }
    if (newPassword !== confirmPassword) {
      setModalError('Wachtwoorden komen niet overeen');
      return;
    }
    setSetupLoading(true);
    setModalError('');
    try {
      await api.post('/auth/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
      });
      closeModal();
      Alert.alert('Wachtwoord gewijzigd', 'Je wachtwoord is succesvol gewijzigd.');
    } catch (err: any) {
      const msg = err.response?.data?.old_password?.[0]
        || err.response?.data?.new_password?.[0]
        || err.response?.data?.error
        || 'Wachtwoord wijzigen mislukt';
      setModalError(msg);
    } finally {
      setSetupLoading(false);
    }
  }

  // ── Account delete ────────────────────────────────────────────────────────────

  async function handleAccountDelete() {
    if (!deleteConfirmed) {
      setModalError('Bevestig dat je begrijpt dat dit permanent is');
      return;
    }
    if (!deletePassword) {
      setModalError('Voer je wachtwoord in om te bevestigen');
      return;
    }
    setSetupLoading(true);
    setModalError('');
    try {
      await api.delete('/auth/me/', { data: { password: deletePassword } });
      closeModal();
      await logout();
    } catch (err: any) {
      setModalError(
        err.response?.data?.error || err.response?.data?.password?.[0] || 'Account verwijderen mislukt'
      );
    } finally {
      setSetupLoading(false);
    }
  }

  // ── Data export ───────────────────────────────────────────────────────────────

  async function handleRequestExport() {
    setExportStatus('loading');
    setModalError('');
    try {
      const res = await api.post('/auth/export-data/');
      if (res.data.download_url) {
        setExportUrl(res.data.download_url);
        setExportStatus('ready');
      } else {
        setExportStatus('ready');
        setModalError('Export wordt aangemaakt. Je ontvangt een e-mail wanneer hij klaar is.');
      }
    } catch (err: any) {
      setExportStatus('idle');
      setModalError(err.response?.data?.error || 'Export aanvragen mislukt');
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  const is2FAEnabled = twoFAStatus?.enabled ?? false;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

      {/* ── 2FA Section ── */}
      <SectionHeader icon="shield-checkmark-outline" title="Twee-Factor Authenticatie (2FA)" />
      <View style={styles.card}>
        <SettingRow
          icon={is2FAEnabled ? 'shield-checkmark' : 'shield-outline'}
          label="Status"
          subtitle={twoFALoading ? 'Laden…' : is2FAEnabled ? 'Ingeschakeld' : 'Uitgeschakeld'}
          rightElement={
            twoFALoading ? (
              <ActivityIndicator size="small" color="#A78BFA" />
            ) : (
              <View style={[styles.statusBadge, is2FAEnabled ? styles.statusBadgeOn : styles.statusBadgeOff]}>
                <Text style={[styles.statusBadgeText, is2FAEnabled ? styles.statusBadgeTextOn : styles.statusBadgeTextOff]}>
                  {is2FAEnabled ? 'AAN' : 'UIT'}
                </Text>
              </View>
            )
          }
        />
        {!twoFALoading && (
          is2FAEnabled ? (
            <SettingRow
              icon="shield-half-outline"
              label="2FA Uitschakelen"
              subtitle="Vereist huidige TOTP code"
              onPress={() => openModal('disable2fa')}
              destructive
            />
          ) : (
            <SettingRow
              icon="qr-code-outline"
              label="2FA Inschakelen"
              subtitle="Scan QR code met authenticator app"
              onPress={handle2FASetupOpen}
            />
          )
        )}
      </View>

      {/* ── Biometric Section ── */}
      <SectionHeader icon="finger-print-outline" title="Biometrische Login" />
      <View style={styles.card}>
        <SettingRow
          icon="finger-print"
          label={Platform.OS === 'ios' ? 'Face ID / Touch ID' : 'Vingerafdruk'}
          subtitle={biometricAvailable ? 'Snel inloggen met biometrie' : 'Niet beschikbaar op dit apparaat'}
          rightElement={
            biometricToggling ? (
              <ActivityIndicator size="small" color="#A78BFA" />
            ) : (
              <Switch
                value={biometricEnabled}
                onValueChange={handleBiometricToggle}
                disabled={!biometricAvailable}
                trackColor={{ false: '#374151', true: '#7C3AED' }}
                thumbColor={biometricEnabled ? '#A78BFA' : '#9CA3AF'}
              />
            )
          }
        />
      </View>

      {/* ── Password Section ── */}
      <SectionHeader icon="lock-closed-outline" title="Wachtwoord Wijzigen" />
      <View style={styles.card}>
        <SettingRow
          icon="key-outline"
          label="Wachtwoord wijzigen"
          subtitle="Minimaal 8 tekens"
          onPress={() => openModal('changePassword')}
        />
      </View>

      {/* ── GDPR Section ── */}
      <SectionHeader icon="document-text-outline" title="Jouw Gegevens (AVG/GDPR)" />
      <View style={styles.card}>
        <SettingRow
          icon="download-outline"
          label="Gegevens exporteren"
          subtitle="Download al jouw persoonsgegevens"
          onPress={() => openModal('exportData')}
        />
        <SettingRow
          icon="trash-outline"
          label="Account verwijderen"
          subtitle="Permanent en onherstelbaar"
          onPress={() => openModal('deleteAccount')}
          destructive
        />
      </View>

      <View style={{ height: 48 }} />

      {/* ════════════════════════════════════════════════════════
          MODAL: 2FA Setup
      ════════════════════════════════════════════════════════ */}
      <Modal visible={activeModal === 'setup2fa'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>2FA Inschakelen</Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {setupLoading && setupStep === 'qr' ? (
              <ActivityIndicator size="large" color="#A78BFA" style={{ marginVertical: 32 }} />
            ) : setupStep === 'qr' ? (
              <>
                <Text style={styles.modalBody}>
                  Scan de QR-code met je authenticator-app (bijv. Google Authenticator of Authy).
                </Text>
                {setupUri ? (
                  <View style={styles.qrContainer}>
                    <QRCodeWebView uri={setupUri} />
                  </View>
                ) : null}
                {modalError ? <Text style={styles.modalError}>{modalError}</Text> : null}
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => { setModalError(''); setSetupStep('verify'); }}
                  disabled={!setupUri}
                >
                  <Text style={styles.primaryButtonText}>Volgende: Code verificeren</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalBody}>
                  Voer de 6-cijferige code uit je authenticator-app in om 2FA te activeren.
                </Text>
                <TextInput
                  style={styles.codeInput}
                  value={totp}
                  onChangeText={setTotp}
                  placeholder="000000"
                  placeholderTextColor="#6B7280"
                  keyboardType="number-pad"
                  maxLength={6}
                  textAlign="center"
                  autoFocus
                />
                {modalError ? <Text style={styles.modalError}>{modalError}</Text> : null}
                <TouchableOpacity
                  style={[styles.primaryButton, setupLoading && styles.primaryButtonDisabled]}
                  onPress={handle2FAVerifySetup}
                  disabled={setupLoading}
                >
                  {setupLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Activeren</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.ghostButton} onPress={() => setSetupStep('qr')}>
                  <Text style={styles.ghostButtonText}>Terug naar QR-code</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ════════════════════════════════════════════════════════
          MODAL: 2FA Disable
      ════════════════════════════════════════════════════════ */}
      <Modal visible={activeModal === 'disable2fa'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>2FA Uitschakelen</Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalBody}>
              Voer je huidige TOTP-code in om twee-factor authenticatie uit te schakelen.
            </Text>
            <TextInput
              style={styles.codeInput}
              value={disableCode}
              onChangeText={setDisableCode}
              placeholder="000000"
              placeholderTextColor="#6B7280"
              keyboardType="number-pad"
              maxLength={6}
              textAlign="center"
              autoFocus
            />
            {modalError ? <Text style={styles.modalError}>{modalError}</Text> : null}
            <TouchableOpacity
              style={[styles.destructiveButton, setupLoading && styles.primaryButtonDisabled]}
              onPress={handle2FADisable}
              disabled={setupLoading}
            >
              {setupLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.destructiveButtonText}>2FA Uitschakelen</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghostButton} onPress={closeModal}>
              <Text style={styles.ghostButtonText}>Annuleren</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ════════════════════════════════════════════════════════
          MODAL: Change Password
      ════════════════════════════════════════════════════════ */}
      <Modal visible={activeModal === 'changePassword'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Wachtwoord Wijzigen</Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.textInput}
              value={oldPassword}
              onChangeText={setOldPassword}
              placeholder="Huidig wachtwoord"
              placeholderTextColor="#6B7280"
              secureTextEntry
              autoCapitalize="none"
            />
            <TextInput
              style={styles.textInput}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Nieuw wachtwoord (min. 8 tekens)"
              placeholderTextColor="#6B7280"
              secureTextEntry
              autoCapitalize="none"
            />
            <TextInput
              style={styles.textInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Bevestig nieuw wachtwoord"
              placeholderTextColor="#6B7280"
              secureTextEntry
              autoCapitalize="none"
            />
            {modalError ? <Text style={styles.modalError}>{modalError}</Text> : null}
            <TouchableOpacity
              style={[styles.primaryButton, setupLoading && styles.primaryButtonDisabled]}
              onPress={handlePasswordChange}
              disabled={setupLoading}
            >
              {setupLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Wachtwoord wijzigen</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghostButton} onPress={closeModal}>
              <Text style={styles.ghostButtonText}>Annuleren</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ════════════════════════════════════════════════════════
          MODAL: Delete Account
      ════════════════════════════════════════════════════════ */}
      <Modal visible={activeModal === 'deleteAccount'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: '#EF4444' }]}>Account Verwijderen</Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <View style={styles.warningBanner}>
              <Ionicons name="warning" size={20} color="#FBBF24" />
              <Text style={styles.warningText}>
                Dit verwijdert permanent al je gegevens, projecten en account. Dit kan niet ongedaan worden gemaakt.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setDeleteConfirmed(!deleteConfirmed)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, deleteConfirmed && styles.checkboxChecked]}>
                {deleteConfirmed && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={styles.checkboxLabel}>
                Ik begrijp dat dit permanent is en niet ongedaan gemaakt kan worden
              </Text>
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              value={deletePassword}
              onChangeText={setDeletePassword}
              placeholder="Jouw wachtwoord ter bevestiging"
              placeholderTextColor="#6B7280"
              secureTextEntry
              autoCapitalize="none"
            />
            {modalError ? <Text style={styles.modalError}>{modalError}</Text> : null}
            <TouchableOpacity
              style={[
                styles.destructiveButton,
                (!deleteConfirmed || setupLoading) && styles.primaryButtonDisabled,
              ]}
              onPress={handleAccountDelete}
              disabled={!deleteConfirmed || setupLoading}
            >
              {setupLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.destructiveButtonText}>Account permanent verwijderen</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghostButton} onPress={closeModal}>
              <Text style={styles.ghostButtonText}>Annuleren</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ════════════════════════════════════════════════════════
          MODAL: Export Data
      ════════════════════════════════════════════════════════ */}
      <Modal visible={activeModal === 'exportData'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Gegevens Exporteren</Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalBody}>
              Op grond van de AVG (GDPR) heb je het recht al je persoonsgegevens op te vragen.
              Je ontvangt een downloadlink per e-mail, of je kunt hem hieronder direct downloaden als hij klaar is.
            </Text>
            {modalError ? (
              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={18} color="#A78BFA" />
                <Text style={styles.infoBoxText}>{modalError}</Text>
              </View>
            ) : null}
            {exportStatus === 'ready' && exportUrl ? (
              <>
                <View style={[styles.infoBox, styles.infoBoxSuccess]}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#34D399" />
                  <Text style={[styles.infoBoxText, { color: '#34D399' }]}>Export is klaar!</Text>
                </View>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => {
                    Alert.alert(
                      'Download link',
                      exportUrl,
                      [{ text: 'OK' }]
                    );
                  }}
                >
                  <Ionicons name="download-outline" size={18} color="#fff" />
                  <Text style={[styles.primaryButtonText, { marginLeft: 8 }]}>Download gegevens</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.primaryButton, exportStatus === 'loading' && styles.primaryButtonDisabled]}
                onPress={handleRequestExport}
                disabled={exportStatus === 'loading'}
              >
                {exportStatus === 'loading' ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Export aanvragen</Text>
                )}
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.ghostButton} onPress={closeModal}>
              <Text style={styles.ghostButtonText}>Sluiten</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191A2E',
  },
  contentContainer: {
    paddingTop: 8,
    paddingBottom: 24,
  },

  // Section headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A78BFA',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Card
  card: {
    marginHorizontal: 16,
    backgroundColor: '#1F2037',
    borderRadius: 12,
    overflow: 'hidden',
  },

  // Setting rows
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#292A40',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#A78BFA18',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingIconWrapDestructive: {
    backgroundColor: '#EF444418',
  },
  settingTextWrap: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    color: '#D1D5DB',
    fontWeight: '500',
  },
  settingLabelDestructive: {
    color: '#EF4444',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  // Status badge
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeOn: {
    backgroundColor: '#34D39918',
  },
  statusBadgeOff: {
    backgroundColor: '#4B556320',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadgeTextOn: {
    color: '#34D399',
  },
  statusBadgeTextOff: {
    color: '#6B7280',
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#1F2037',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F3F4F6',
  },
  modalBody: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalError: {
    fontSize: 13,
    color: '#EF4444',
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },

  // QR code
  qrContainer: {
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  qrWebView: {
    width: 220,
    height: 220,
    backgroundColor: 'transparent',
  },

  // Inputs
  codeInput: {
    backgroundColor: '#292A40',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
    padding: 16,
    fontSize: 28,
    color: '#F3F4F6',
    letterSpacing: 10,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: '#292A40',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#F3F4F6',
    marginBottom: 12,
  },

  // Buttons
  primaryButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  destructiveButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  destructiveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  ghostButton: {
    padding: 12,
    alignItems: 'center',
  },
  ghostButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
  },

  // Warning banner
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(251,191,36,0.1)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FBBF2430',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#D1D5DB',
    lineHeight: 18,
  },

  // Checkbox
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#4B5563',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    color: '#D1D5DB',
    lineHeight: 18,
  },

  // Info box
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#A78BFA18',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  infoBoxSuccess: {
    backgroundColor: '#34D39918',
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    color: '#A78BFA',
    lineHeight: 18,
  },
});

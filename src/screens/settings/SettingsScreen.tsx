import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../../contexts/LanguageContext';
import { COLORS } from '../../constants/colors';

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  isSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  iconColor?: string;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  label,
  value,
  onPress,
  isSwitch,
  switchValue,
  onSwitchChange,
  iconColor = COLORS.purple,
}) => (
  <TouchableOpacity
    style={styles.settingItem}
    onPress={onPress}
    disabled={isSwitch}
    activeOpacity={0.7}
  >
    <View style={styles.settingLeft}>
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={styles.settingLabel}>{label}</Text>
    </View>
    {isSwitch ? (
      <Switch
        value={switchValue}
        onValueChange={onSwitchChange}
        trackColor={{ false: COLORS.gray[300], true: `${COLORS.purple}50` }}
        thumbColor={switchValue ? COLORS.purple : COLORS.gray[100]}
      />
    ) : (
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
      </View>
    )}
  </TouchableOpacity>
);

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { language, setLanguage, t } = useLanguage();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const handleLanguagePress = () => {
    Alert.alert(
      t.language,
      language === 'nl' ? 'Kies je taal' : 'Choose your language',
      [
        {
          text: '🇳🇱 Nederlands',
          onPress: () => setLanguage('nl'),
        },
        {
          text: '🇬🇧 English',
          onPress: () => setLanguage('en'),
        },
        {
          text: t.cancel,
          style: 'cancel',
        },
      ]
    );
  };

  const handleAboutPress = () => {
    Alert.alert(
      'ProjeXtPal',
      `${t.version}: 1.0.0\n\n© 2024 Inclufy\nAll rights reserved.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.purple, COLORS.pink]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.settings}</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'nl' ? 'Algemeen' : 'General'}
          </Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="language"
              label={t.language}
              value={language === 'nl' ? '🇳🇱 Nederlands' : '🇬🇧 English'}
              onPress={handleLanguagePress}
              iconColor={COLORS.purple}
            />
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'nl' ? 'Voorkeuren' : 'Preferences'}
          </Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="notifications"
              label={t.notifications}
              isSwitch
              switchValue={notificationsEnabled}
              onSwitchChange={setNotificationsEnabled}
              iconColor={COLORS.blue}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="moon"
              label={t.darkMode}
              isSwitch
              switchValue={darkModeEnabled}
              onSwitchChange={setDarkModeEnabled}
              iconColor={COLORS.indigo}
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'nl' ? 'Account' : 'Account'}
          </Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="person"
              label={t.profile}
              onPress={() => navigation.navigate('Profile' as never)}
              iconColor={COLORS.green}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="shield-checkmark"
              label={language === 'nl' ? 'Privacy' : 'Privacy'}
              onPress={() => {}}
              iconColor={COLORS.teal}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="key"
              label={language === 'nl' ? 'Wachtwoord wijzigen' : 'Change Password'}
              onPress={() => {}}
              iconColor={COLORS.orange}
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'nl' ? 'Ondersteuning' : 'Support'}
          </Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="help-circle"
              label={language === 'nl' ? 'Help & FAQ' : 'Help & FAQ'}
              onPress={() => {}}
              iconColor={COLORS.cyan}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="chatbubbles"
              label={language === 'nl' ? 'Contact' : 'Contact Us'}
              onPress={() => {}}
              iconColor={COLORS.pink}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="information-circle"
              label={t.about}
              onPress={handleAboutPress}
              iconColor={COLORS.purple}
            />
          </View>
        </View>

        {/* Version Info */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>ProjeXtPal v1.0.0</Text>
          <Text style={styles.copyrightText}>© 2024 Inclufy</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.gray[800],
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: COLORS.gray[500],
    marginRight: 8,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray[100],
    marginLeft: 64,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 14,
    color: COLORS.gray[400],
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: COLORS.gray[400],
  },
});

export default SettingsScreen;

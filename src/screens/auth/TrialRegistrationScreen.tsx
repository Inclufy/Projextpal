import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import authService from '../../services/authService';

export default function TrialRegistrationScreen({ navigation }: any) {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    companyName: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is verplicht';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Ongeldig email adres';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Voornaam is verplicht';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Achternaam is verplicht';
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Bedrijfsnaam is verplicht';
    }

    if (!formData.password) {
      newErrors.password = 'Wachtwoord is verplicht';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Wachtwoord moet minimaal 8 karakters zijn';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Wachtwoorden komen niet overeen';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      await authService.register({
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        company_name: formData.companyName,
        password: formData.password,
        subscription_tier: 'trial', // Mark as trial registration
      });

      Alert.alert(
        'Registratie Gelukt! 🎉',
        'Check je email om je account te verifiëren. Je gratis trial van 14 dagen begint na verificatie.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Registratie Mislukt',
        error.message || 'Er is iets misgegaan. Probeer het opnieuw.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <LinearGradient
            colors={['#7C3AED', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <Text style={styles.emoji}>🚀</Text>
              <Text style={styles.headerTitle}>Start Je Gratis Trial</Text>
              <Text style={styles.headerSubtitle}>
                14 dagen volledig gratis - geen creditcard nodig
              </Text>
            </View>
          </LinearGradient>

          {/* Trial Benefits */}
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Wat krijg je:</Text>
            
            <View style={styles.benefit}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.benefitText}>14 dagen gratis trial</Text>
            </View>
            
            <View style={styles.benefit}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.benefitText}>Toegang tot alle Basic features</Text>
            </View>
            
            <View style={styles.benefit}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.benefitText}>Tot 5 teamleden</Text>
            </View>
            
            <View style={styles.benefit}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.benefitText}>Tot 10 projecten</Text>
            </View>
            
            <View style={styles.benefit}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.benefitText}>Geen creditcard vereist</Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Maak Je Account</Text>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="jouw@email.nl"
                  value={formData.email}
                  onChangeText={(text) => {
                    setFormData({ ...formData, email: text });
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* First Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Voornaam *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Jan"
                  value={formData.firstName}
                  onChangeText={(text) => {
                    setFormData({ ...formData, firstName: text });
                    if (errors.firstName) setErrors({ ...errors, firstName: undefined });
                  }}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>
              {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
            </View>

            {/* Last Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Achternaam *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Jansen"
                  value={formData.lastName}
                  onChangeText={(text) => {
                    setFormData({ ...formData, lastName: text });
                    if (errors.lastName) setErrors({ ...errors, lastName: undefined });
                  }}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>
              {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
            </View>

            {/* Company Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Bedrijfsnaam *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="business-outline" size={20} color="#9CA3AF" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Mijn Bedrijf BV"
                  value={formData.companyName}
                  onChangeText={(text) => {
                    setFormData({ ...formData, companyName: text });
                    if (errors.companyName) setErrors({ ...errors, companyName: undefined });
                  }}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>
              {errors.companyName && <Text style={styles.errorText}>{errors.companyName}</Text>}
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Wachtwoord *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Min. 8 karakters"
                  value={formData.password}
                  onChangeText={(text) => {
                    setFormData({ ...formData, password: text });
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Bevestig Wachtwoord *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Herhaal wachtwoord"
                  value={formData.confirmPassword}
                  onChangeText={(text) => {
                    setFormData({ ...formData, confirmPassword: text });
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                  }}
                  secureTextEntry={!showConfirmPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              <LinearGradient
                colors={['#7C3AED', '#EC4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Start Gratis Trial 🚀</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Terms */}
            <Text style={styles.terms}>
              Door te registreren ga je akkoord met onze{' '}
              <Text style={styles.link}>Algemene Voorwaarden</Text> en{' '}
              <Text style={styles.link}>Privacy Policy</Text>
            </Text>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Al een account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Inloggen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  
  header: { padding: 24, paddingTop: 16 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  headerContent: { alignItems: 'center' },
  emoji: { fontSize: 48, marginBottom: 8 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },
  
  benefitsContainer: { backgroundColor: '#fff', margin: 16, padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  benefitsTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 },
  benefit: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  benefitText: { fontSize: 16, color: '#374151', marginLeft: 12 },
  
  formContainer: { padding: 24 },
  formTitle: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', marginBottom: 24 },
  
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 16, height: 56 },
  icon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#1F2937' },
  eyeIcon: { padding: 8 },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  
  submitButton: { borderRadius: 12, overflow: 'hidden', marginTop: 8 },
  submitButtonDisabled: { opacity: 0.6 },
  submitGradient: { height: 56, justifyContent: 'center', alignItems: 'center' },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  
  terms: { fontSize: 12, color: '#6B7280', textAlign: 'center', marginTop: 16, lineHeight: 18 },
  link: { color: '#7C3AED', fontWeight: '600' },
  
  loginContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  loginText: { fontSize: 14, color: '#6B7280' },
  loginLink: { fontSize: 14, color: '#7C3AED', fontWeight: '600' },
});

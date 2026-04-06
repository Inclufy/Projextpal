import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { projectsService } from '../../services/projects';

export const NewProjectScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { programId } = route.params || {};
  
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning',
    budget: '',
    start_date: '',
    end_date: '',
    methodology: 'agile',
  });

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      Alert.alert(t('common.error'), 'Project naam is verplicht');
      return;
    }

    try {
      setSubmitting(true);
      
      const projectData: any = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
        methodology: formData.methodology,
      };

      if (formData.budget) {
        projectData.budget = parseFloat(formData.budget);
      }
      if (formData.start_date) {
        projectData.start_date = formData.start_date;
      }
      if (formData.end_date) {
        projectData.end_date = formData.end_date;
      }
      if (programId) {
        projectData.program_id = programId;
      }

      await projectsService.createProject(projectData);
      
      Alert.alert(t('common.success'), 'Project succesvol aangemaakt');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to create project:', error);
      Alert.alert(t('common.error'), 'Kon project niet aanmaken');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#3B82F6', '#8B5CF6']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Nieuw Project</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Text style={styles.label}>Projectnaam *</Text>
          <TextInput
            style={styles.input}
            placeholder="Bijv. Website Redesign"
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Beschrijving</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Projectomschrijving..."
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            multiline
            numberOfLines={4}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Methodologie</Text>
          <View style={styles.optionsRow}>
            {['agile', 'scrum', 'waterfall', 'kanban'].map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.optionButton,
                  formData.methodology === method && styles.optionButtonActive
                ]}
                onPress={() => setFormData(prev => ({ ...prev, methodology: method }))}
              >
                <Text style={[
                  styles.optionText,
                  formData.methodology === method && styles.optionTextActive
                ]}>
                  {method.charAt(0).toUpperCase() + method.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Status</Text>
          <View style={styles.optionsRow}>
            {['planning', 'active', 'on_hold'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.optionButton,
                  formData.status === status && styles.optionButtonActive
                ]}
                onPress={() => setFormData(prev => ({ ...prev, status }))}
              >
                <Text style={[
                  styles.optionText,
                  formData.status === status && styles.optionTextActive
                ]}>
                  {status === 'planning' ? 'Planning' : status === 'active' ? 'Actief' : 'On Hold'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Budget (€)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            value={formData.budget}
            onChangeText={(text) => setFormData(prev => ({ ...prev, budget: text }))}
            keyboardType="decimal-pad"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Startdatum</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={formData.start_date}
            onChangeText={(text) => setFormData(prev => ({ ...prev, start_date: text }))}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Einddatum</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={formData.end_date}
            onChangeText={(text) => setFormData(prev => ({ ...prev, end_date: text }))}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleCreate}
          disabled={submitting}
        >
          <LinearGradient colors={['#3B82F6', '#8B5CF6']} style={styles.submitGradient}>
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text style={styles.submitButtonText}>Project Aanmaken</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

// Also export as AddProjectScreen for backward compatibility
export const AddProjectScreen = NewProjectScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  backButton: { padding: 8 },
  title: { flex: 1, fontSize: 24, fontWeight: 'bold', color: 'white', textAlign: 'center' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  form: { backgroundColor: 'white', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  label: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1, borderColor: '#E5E7EB', color: '#1F2937' },
  textArea: { height: 100, textAlignVertical: 'top' },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  optionButton: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, borderWidth: 2, borderColor: '#E5E7EB', backgroundColor: 'white' },
  optionButtonActive: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  optionText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  optionTextActive: { color: '#3B82F6' },
  submitButton: { borderRadius: 12, overflow: 'hidden', marginTop: 24 },
  submitButtonDisabled: { opacity: 0.7 },
  submitGradient: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  submitButtonText: { fontSize: 16, fontWeight: '600', color: 'white' },
});

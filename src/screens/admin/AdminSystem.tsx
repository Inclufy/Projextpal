import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { adminService, SystemInfo } from '../../services/adminService';

export const AdminSystem: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [health, setHealth] = useState({ status: 'checking', last_check: '' });

  useEffect(() => {
    loadData();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      if (!refreshing) setLoading(true);
      const [infoData, healthData] = await Promise.all([
        adminService.getSystemInfo(),
        adminService.getSystemHealth(),
      ]);
      setSystemInfo(infoData);
      setHealth(healthData);
    } catch (error) {
      console.error('Error loading system info:', error);
      Alert.alert('Error', 'Failed to load system information');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'operational': return '#10B981';
      case 'degraded': return '#F59E0B';
      case 'down': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case 'operational': return 'checkmark-circle';
      case 'degraded': return 'warning';
      case 'down': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'operational': return 'Operational';
      case 'degraded': return 'Degraded';
      case 'down': return 'Down';
      default: return 'Unknown';
    }
  };

  const formatLastCheck = (timestamp: string): string => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    return `${diffMins} minutes ago`;
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Loading system status...</Text>
      </View>
    );
  }

  if (!systemInfo) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text style={styles.errorText}>Failed to load system information</Text>
      </View>
    );
  }

  const isAllOperational = systemInfo.services.every(s => s.status === 'operational');
  const healthStatus = isAllOperational ? 'operational' : 'degraded';

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8B5CF6']} />}
    >
      <Text style={styles.pageTitle}>🖥️ {t('system.title')}</Text>
      <Text style={styles.pageSubtitle}>{t('system.subtitle')}</Text>
      
      <View style={styles.healthBanner}>
        <LinearGradient 
          colors={healthStatus === 'operational' ? ['#10B981', '#059669'] : ['#F59E0B', '#D97706']} 
          style={styles.healthGradient}
        >
          <Ionicons 
            name={getStatusIcon(healthStatus)} 
            size={40} 
            color="white" 
          />
          <View style={styles.healthTextContainer}>
            <Text style={styles.healthTitle}>
              {healthStatus === 'operational' ? t('system.allOperational') : 'System Degraded'}
            </Text>
            <Text style={styles.healthSubtitle}>
              {t('system.lastCheck')}: {formatLastCheck(health.last_check)}
            </Text>
          </View>
        </LinearGradient>
      </View>

      <Text style={styles.sectionTitle}>{t('system.servicesStatus')}</Text>
      {systemInfo.services.map((service, index) => (
        <View key={index} style={styles.serviceCard}>
          <View style={styles.serviceHeader}>
            <View style={styles.serviceNameContainer}>
              <Ionicons 
                name="ellipse" 
                size={12} 
                color={getStatusColor(service.status)} 
              />
              <Text style={styles.serviceName}>{service.name}</Text>
            </View>
            <View style={styles.serviceStats}>
              {service.response_time && (
                <Text style={styles.responseTime}>{service.response_time}ms</Text>
              )}
              <Text style={styles.serviceUptime}>{service.uptime}</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: service.uptime,
                  backgroundColor: getStatusColor(service.status)
                }
              ]} 
            />
          </View>
          <Text style={[styles.serviceStatus, { color: getStatusColor(service.status) }]}>
            {getStatusText(service.status)}
          </Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>{t('system.systemInfo')}</Text>
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="information-circle" size={20} color="#8B5CF6" />
            <Text style={styles.infoLabel}>{t('system.version')}</Text>
          </View>
          <Text style={styles.infoValue}>{systemInfo.version}</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="cloud-upload" size={20} color="#10B981" />
            <Text style={styles.infoLabel}>{t('system.lastBackup')}</Text>
          </View>
          <Text style={styles.infoValue}>{systemInfo.last_backup}</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="server" size={20} color="#F59E0B" />
            <Text style={styles.infoLabel}>{t('system.environment')}</Text>
          </View>
          <View style={[
            styles.envBadge,
            { backgroundColor: systemInfo.environment === 'production' ? '#DCFCE7' : '#FEF3C7' }
          ]}>
            <Text style={[
              styles.envBadgeText,
              { color: systemInfo.environment === 'production' ? '#10B981' : '#F59E0B' }
            ]}>
              {systemInfo.environment === 'production' ? t('system.production') : systemInfo.environment.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { fontSize: 16, color: '#6B7280', marginTop: 16 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  errorText: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginTop: 16 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  pageSubtitle: { fontSize: 15, color: '#6B7280', marginBottom: 20 },
  
  healthBanner: { borderRadius: 16, overflow: 'hidden', marginBottom: 24, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  healthGradient: { flexDirection: 'row', alignItems: 'center', padding: 24, gap: 16 },
  healthTextContainer: { flex: 1 },
  healthTitle: { fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 4 },
  healthSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.9)' },
  
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginTop: 8, marginBottom: 16 },
  
  serviceCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  serviceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  serviceNameContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  serviceName: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  serviceStats: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  responseTime: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  serviceUptime: { fontSize: 14, fontWeight: 'bold', color: '#10B981' },
  progressBar: { height: 6, backgroundColor: '#F3F4F6', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 3 },
  serviceStatus: { fontSize: 12, fontWeight: '600' },
  
  infoCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoLabel: { fontSize: 14, color: '#6B7280' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  envBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  envBadgeText: { fontSize: 12, fontWeight: 'bold' },
});
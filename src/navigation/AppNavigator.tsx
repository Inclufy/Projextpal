import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { COLORS } from '../constants/colors';
import { useAuthStore } from '../store/authStore';
import { AuthNavigator } from './AuthNavigator';

// All Screens
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { ProjectsScreen } from '../screens/projects/ProjectsScreen';
import { ProjectDetailScreen } from '../screens/projects/ProjectDetailScreen';
import { ProgramsScreen } from '../screens/programs/ProgramsScreen';
import { ProgramDetailScreen } from '../screens/programs/ProgramDetailScreen';
import { BudgetScreen } from '../screens/budget/BudgetScreen';
import { BudgetDetailScreen } from '../screens/budget/BudgetDetailScreen';
import { RisksScreen } from '../screens/risks/RisksScreen';
import { RiskDetailScreen } from '../screens/risks/RiskDetailScreen';
import { CoursesScreen } from '../screens/courses/CoursesScreen';
import { CourseDetailScreen } from '../screens/courses/CourseDetailScreen';
import { AcademyScreen } from '../screens/academy/AcademyScreen';
import { TimeTrackingScreen } from '../screens/timetracking/TimeTrackingScreen';
import { TimeTrackingDetailScreen } from '../screens/timetracking/TimeTrackingDetailScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { AIChatScreen } from '../screens/ai/AIChatScreen';

// Admin Screens
import { AdminPortalScreen } from '../screens/admin/AdminPortalScreen';
import { AdminDashboard } from '../screens/admin/AdminDashboard';
import { AdminUsers } from '../screens/admin/AdminUsers';
import { AdminActivity } from '../screens/admin/AdminActivity';
import { AdminSystem } from '../screens/admin/AdminSystem';

//Profile screens
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { NotificationsScreen } from '../screens/profile/NotificationsScreen';
import { PrivacyScreen } from '../screens/profile/PrivacyScreen';
import { SupportScreen } from '../screens/profile/SupportScreen';
import { AboutScreen } from '../screens/profile/AboutScreen';
import { NewProjectScreen, AddProjectScreen } from '../screens/projects/NewProjectScreen';
import { ReportsScreen } from '../screens/reports/ReportsScreen';
import PricingScreen from '../screens/app/PricingScreen';


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabBarIcon = ({ name, focused, color }: { name: keyof typeof Ionicons.glyphMap; focused: boolean; color: string }) => (
  <View style={[styles.tabIconContainer, focused && styles.tabIconContainerActive]}>
    <Ionicons name={name} size={24} color={color} />
    {focused && <View style={styles.activeIndicator} />}
  </View>
);

const MainTabNavigator = () => {
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          switch (route.name) {
            case 'Home': iconName = focused ? 'home' : 'home-outline'; break;
            case 'Projects': iconName = focused ? 'folder' : 'folder-outline'; break;
            case 'Programs': iconName = focused ? 'layers' : 'layers-outline'; break;
            case 'Academy': iconName = focused ? 'school' : 'school-outline'; break;
            case 'Profile': iconName = focused ? 'person' : 'person-outline'; break;
            default: iconName = 'help-outline';
          }
          return <TabBarIcon name={iconName} focused={focused} color={color} />;
        },
        tabBarActiveTintColor: COLORS.purple,
        tabBarInactiveTintColor: COLORS.gray[400],
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 88 : 65,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 10,
          borderTopWidth: 0,
          backgroundColor: COLORS.white,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 10,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 4 },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} options={{ tabBarLabel: t.home }} />
      <Tab.Screen name="Projects" component={ProjectsScreen} options={{ tabBarLabel: t.projects }} />
      <Tab.Screen name="Programs" component={ProgramsScreen} options={{ tabBarLabel: t.programs }} />
      <Tab.Screen name="Academy" component={AcademyScreen} options={{ tabBarLabel: t.academy }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: t.profile }} />
    </Tab.Navigator>
  );
};

const MainStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      {/* Main Tabs */}
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      
      {/* Project Screens */}
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} options={{ animation: 'slide_from_bottom' }} />
      
      {/* Program Screens */}
      <Stack.Screen name="ProgramDetail" component={ProgramDetailScreen} options={{ animation: 'slide_from_bottom' }} />
      
      {/* Budget Screens */}
      <Stack.Screen name="Budget" component={BudgetScreen} />
      <Stack.Screen name="BudgetDetail" component={BudgetDetailScreen} options={{ animation: 'slide_from_bottom' }} />
      
      {/* Risk Screens */}
      <Stack.Screen name="Risks" component={RisksScreen} />
      <Stack.Screen name="RiskDetail" component={RiskDetailScreen} options={{ animation: 'slide_from_bottom' }} />
      
      {/* Course Screens */}
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} options={{ animation: 'slide_from_bottom' }} />
      
      {/* Time Tracking Screens */}
      <Stack.Screen name="TimeTracking" component={TimeTrackingScreen} />
      <Stack.Screen name="TimeTrackingDetail" component={TimeTrackingDetailScreen} options={{ animation: 'slide_from_bottom' }} />
      
      {/* Settings */}
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ animation: 'slide_from_right' }} />
      
      {/* AI Chat */}
      <Stack.Screen name="AIChat" component={AIChatScreen} options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
      
      {/* Admin Screens */}
      <Stack.Screen name="AdminPortal" component={AdminPortalScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      <Stack.Screen name="AdminUsers" component={AdminUsers} />
      <Stack.Screen name="AdminActivity" component={AdminActivity} />
      <Stack.Screen name="AdminSystem" component={AdminSystem} />
      <Stack.Screen name="NewProject" component={NewProjectScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddProject" component={AddProjectScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Reports" component={ReportsScreen} options={{ headerShown: false }} />
      
      {/* Profile Screens */}
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Privacy" 
        component={PrivacyScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Support" 
        component={SupportScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="About" 
        component={AboutScreen}
        options={{ headerShown: false }}
      />
        <Stack.Screen 
  name="Pricing" 
  component={PricingScreen}
  options={{ 
    headerShown: false,
    presentation: 'modal'  // Optioneel: opent als modal
  }}
/>
          </Stack.Navigator>
        );
      };

// ==================== MAIN APP NAVIGATOR WITH AUTH CHECK ====================
export const AppNavigator = () => {
  const { isAuthenticated, loadUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 Checking authentication...');
      try {
        await loadUser();
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.purple} />
      </View>
    );
  }

  // Show Auth screens (Login/Register) if not authenticated
  if (!isAuthenticated) {
    console.log('⚠️ Not authenticated - showing Login screen');
    return <AuthNavigator />;
  }

  // Show Main app if authenticated
  console.log('✅ Authenticated - showing Main app');
  return <MainStackNavigator />;
};

const styles = StyleSheet.create({
  tabIconContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 4 },
  tabIconContainerActive: { transform: [{ scale: 1.05 }] },
  activeIndicator: { position: 'absolute', bottom: -8, width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.purple },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white },
});

export default AppNavigator;
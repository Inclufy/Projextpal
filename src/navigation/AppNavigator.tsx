import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../contexts/AuthContext';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import TwoFactorScreen from '../screens/auth/TwoFactorScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Main screens
import DashboardScreen from '../screens/main/DashboardScreen';
import ProjectsScreen from '../screens/main/ProjectsScreen';
import ProjectDetailScreen from '../screens/main/ProjectDetailScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Academy screens
import AcademyScreen from '../screens/academy/AcademyScreen';
import CourseDetailScreen from '../screens/academy/CourseDetailScreen';
import LessonPlayerScreen from '../screens/academy/LessonPlayerScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const ProjectsStack = createNativeStackNavigator();
const AcademyStack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: '#191A2E' },
  headerTintColor: '#F3F4F6',
  headerTitleStyle: { fontWeight: '600' as const },
  headerShadowVisible: false,
};

function ProjectsStackScreen() {
  return (
    <ProjectsStack.Navigator screenOptions={screenOptions}>
      <ProjectsStack.Screen
        name="ProjectsList"
        component={ProjectsScreen}
        options={{ title: 'Projects' }}
      />
      <ProjectsStack.Screen
        name="ProjectDetail"
        component={ProjectDetailScreen}
        options={({ route }: any) => ({ title: 'Project' })}
      />
    </ProjectsStack.Navigator>
  );
}

function AcademyStackScreen() {
  return (
    <AcademyStack.Navigator screenOptions={screenOptions}>
      <AcademyStack.Screen
        name="AcademyList"
        component={AcademyScreen}
        options={{ title: 'Academy' }}
      />
      <AcademyStack.Screen
        name="CourseDetail"
        component={CourseDetailScreen}
        options={({ route }: any) => ({ title: 'Course' })}
      />
      <AcademyStack.Screen
        name="LessonPlayer"
        component={LessonPlayerScreen}
        options={({ route }: any) => ({
          title: route.params?.lessonTitle || 'Lesson',
        })}
      />
    </AcademyStack.Navigator>
  );
}

function MainTabs() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'DashboardTab') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'ProjectsTab') iconName = focused ? 'folder-open' : 'folder-open-outline';
          else if (route.name === 'AcademyTab') iconName = focused ? 'school' : 'school-outline';
          else if (route.name === 'ProfileTab') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#A78BFA',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#191A2E',
          borderTopColor: '#1F2037',
          paddingBottom: 4,
          height: 56,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          title: t('tabs.dashboard'),
          headerShown: true,
          ...screenOptions,
          headerTitle: 'ProjeXtPal',
        }}
      />
      <Tab.Screen
        name="ProjectsTab"
        component={ProjectsStackScreen}
        options={{ title: t('tabs.projects') }}
      />
      <Tab.Screen
        name="AcademyTab"
        component={AcademyStackScreen}
        options={{ title: t('tabs.academy') }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: t('tabs.profile'),
          headerShown: true,
          ...screenOptions,
          headerTitle: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ ...screenOptions, headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="TwoFactor" component={TwoFactorScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

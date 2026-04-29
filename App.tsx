import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import type { LinkingOptions } from '@react-navigation/native';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { registerForPushNotificationsAsync } from './src/services/pushService';

// Deep link routing.
//
// The custom scheme `projextpal://` is declared in app.json and was previously
// parsed by `src/utils/linking.ts` but never wired to the navigator. This
// LinkingOptions block tells React Navigation how to map both the custom
// scheme AND universal links (https://projextpal.com/...) to screen names.
//
// Note: universal-link support also requires the backend to serve
// `/.well-known/apple-app-site-association` and `/.well-known/assetlinks.json`
// — those files are checked into `backend/static/.well-known/` and routed by
// the Django config.
const linking: LinkingOptions<ReactNavigation.RootParamList> = {
  prefixes: ['projextpal://', 'https://projextpal.com'],
  config: {
    screens: {
      // Auth
      Login: 'login',
      Register: 'register',
      // Main app
      MainTabs: {
        screens: {
          Home: 'dashboard',
          Projects: 'projects',
          Programs: 'programs',
          Academy: 'academy',
          Profile: 'profile',
        },
      },
      ProjectDetail: 'projects/:projectId',
      ProgramDetail: 'programs/:programId',
      CourseDetail: 'academy/course/:courseSlug',
      LessonDetail: 'academy/course/:courseSlug/lesson/:lessonId',
      Pricing: 'pricing',
      // Subscription callback (used by PricingScreen WebView)
      SubscriptionSuccess: 'subscription-success',
    } as any,
  },
};

export default function App() {
  useEffect(() => {
    // Fire-and-forget — the service swallows errors so the app boots even if
    // permissions are denied or the backend endpoint is still 404.
    registerForPushNotificationsAsync();
  }, []);

  return (
    <LanguageProvider>
      <NavigationContainer linking={linking}>
        <AppNavigator />
      </NavigationContainer>
    </LanguageProvider>
  );
}

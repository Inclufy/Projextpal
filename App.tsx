import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import type { LinkingOptions } from '@react-navigation/native';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { registerForPushNotificationsAsync } from './src/services/pushService';
import { useShakeToReport } from './src/hooks/useShakeToReport';
import { ShakeReportSheet } from './src/components/ShakeReportSheet';

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
  const navigationRef = useNavigationContainerRef();
  const [routeName, setRouteName] = useState<string | null>(null);
  const [shakeSheetVisible, setShakeSheetVisible] = useState(false);
  const routeNameRef = useRef<string | null>(null);

  useEffect(() => {
    // Fire-and-forget — the service swallows errors so the app boots even if
    // permissions are denied or the backend endpoint is still 404.
    registerForPushNotificationsAsync();
  }, []);

  // Shake-to-report — opens a bottom sheet that POSTs to /product-issues/.
  useShakeToReport({
    enabled: !shakeSheetVisible,
    onShake: () => setShakeSheetVisible(true),
  });

  return (
    <LanguageProvider>
      <NavigationContainer
        ref={navigationRef}
        linking={linking}
        onReady={() => {
          const r = navigationRef.getCurrentRoute()?.name ?? null;
          routeNameRef.current = r;
          setRouteName(r);
        }}
        onStateChange={() => {
          const r = navigationRef.getCurrentRoute()?.name ?? null;
          if (r !== routeNameRef.current) {
            routeNameRef.current = r;
            setRouteName(r);
          }
        }}
      >
        <AppNavigator />
      </NavigationContainer>
      <ShakeReportSheet
        visible={shakeSheetVisible}
        onClose={() => setShakeSheetVisible(false)}
        routeName={routeName}
      />
    </LanguageProvider>
  );
}

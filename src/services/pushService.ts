import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { apiService } from './apiService';

// `expo-notifications` is installed at runtime (see package.json). We load it
// lazily via require() so the type-checker doesn't fail on builds where the
// dependency hasn't been `npm install`-ed yet (e.g., CI lint passes before
// install). At runtime, missing the module simply disables push.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Notifications: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Notifications = require('expo-notifications');
} catch {
  Notifications = null;
}

/**
 * Push notification registration.
 *
 * Lifecycle:
 *  1. App startup calls `registerForPushNotificationsAsync()`.
 *  2. We request permission. If denied, we silently bail.
 *  3. We pull the Expo push token (requires a configured projectId in EAS).
 *  4. We POST it to `/api/v1/auth/devices/register/`.
 *
 * Important: as of 2026-04-28 the backend `/auth/devices/register/` endpoint
 * does NOT exist (returns 404). We catch and log that case so the app boots
 * normally — push delivery is non-functional but nothing crashes. Once the
 * Django `DeviceTokenViewSet` ships (see backend FIXME flag), this service
 * needs no changes.
 */

// Configure foreground presentation behavior. Without this, iOS shows nothing
// while the app is open. Skipped if expo-notifications isn't loaded.
if (Notifications?.setNotificationHandler) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export interface RegisterDeviceResult {
  token: string | null;
  registered: boolean;
  reason?: string;
}

async function getExpoPushToken(): Promise<string | null> {
  if (!Notifications?.getExpoPushTokenAsync) return null;
  try {
    const projectId =
      (Constants.expoConfig as any)?.extra?.eas?.projectId ||
      (Constants as any).easConfig?.projectId;

    const response = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    return response?.data ?? null;
  } catch (error) {
    console.warn('Failed to obtain Expo push token:', error);
    return null;
  }
}

export async function registerForPushNotificationsAsync(): Promise<RegisterDeviceResult> {
  // Push tokens are not available on web / Expo Go for iOS in SDK 53+.
  if (Platform.OS === 'web') {
    return { token: null, registered: false, reason: 'unsupported-platform' };
  }

  if (!Notifications) {
    return { token: null, registered: false, reason: 'module-missing' };
  }

  try {
    const settings = await Notifications.getPermissionsAsync();
    let status = settings.status;
    if (status !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      status = requested.status;
    }
    if (status !== 'granted') {
      return { token: null, registered: false, reason: 'permission-denied' };
    }

    const token = await getExpoPushToken();
    if (!token) {
      return { token: null, registered: false, reason: 'no-token' };
    }

    const platform: 'ios' | 'android' = Platform.OS === 'ios' ? 'ios' : 'android';

    try {
      await apiService.post('/api/v1/auth/devices/register/', { token, platform });
      return { token, registered: true };
    } catch (error: any) {
      // Backend endpoint may not be implemented yet (404). Don't surface this
      // as a crash — push delivery just won't work until the backend ships.
      const msg = error?.message || String(error);
      console.warn(
        '[pushService] Device registration skipped — backend not ready:',
        msg
      );
      return { token, registered: false, reason: 'backend-404' };
    }
  } catch (error: any) {
    console.warn('[pushService] registerForPushNotificationsAsync failed:', error?.message || error);
    return { token: null, registered: false, reason: 'error' };
  }
}

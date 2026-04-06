import * as Linking from 'expo-linking';
import { useEffect } from 'react';

/**
 * Deep linking utility for ProjeXtPal mobile app
 */

export const useLinking = (onLink: (path: string, params?: any) => void) => {
  useEffect(() => {
    // Handle initial URL
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url, onLink);
      }
    });

    // Handle URLs when app is open
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url, onLink);
    });

    return () => {
      subscription.remove();
    };
  }, []);
};

const handleDeepLink = (url: string, onLink: (path: string, params?: any) => void) => {
  const { path, queryParams } = Linking.parse(url);

  console.log('Deep link received:', { url, path, queryParams });

  if (path && onLink) {
    onLink(path, queryParams);
  }
};

export const createDeepLink = (path: string, params?: Record<string, string>): string => {
  return Linking.createURL(path, { queryParams: params });
};

export const openURL = async (url: string): Promise<boolean> => {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error opening URL:', error);
    return false;
  }
};

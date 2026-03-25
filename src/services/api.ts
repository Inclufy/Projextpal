import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://projextpal.com/api/v1';

// Callback for 401 auth state sync
let onUnauthorized: (() => void) | null = null;
export function setOnUnauthorized(callback: (() => void) | null) {
  onUnauthorized = callback;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
  } catch {
    // SecureStore may fail on first launch
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('auth_token');
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

export default api;

import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';
import type { AppConfig, AgentConfig } from './types.js';

dotenvConfig({ path: resolve(process.cwd(), '.env') });

const APP_CONFIGS: Record<string, () => AppConfig> = {
  projectpal: () => ({
    name: 'ProjeXtPal',
    baseUrl: process.env.PROJECTPAL_BASE_URL || 'http://localhost:8083',
    apiUrl: process.env.PROJECTPAL_API_URL || 'http://localhost:8083',
    credentials: {
      email: process.env.PROJECTPAL_TEST_EMAIL || 'test@example.com',
      password: process.env.PROJECTPAL_TEST_PASSWORD || 'password123',
    },
  }),
  finance: () => ({
    name: 'Inclufy Finance',
    baseUrl: process.env.FINANCE_BASE_URL || 'http://localhost:3000',
    apiUrl: process.env.FINANCE_API_URL || 'http://localhost:8000',
    credentials: {
      email: process.env.FINANCE_TEST_EMAIL || 'test@example.com',
      password: process.env.FINANCE_TEST_PASSWORD || 'password123',
    },
  }),
  marketing: () => ({
    name: 'Inclufy Marketing',
    baseUrl: process.env.MARKETING_BASE_URL || 'http://localhost:3001',
    apiUrl: process.env.MARKETING_API_URL || 'http://localhost:8001',
    credentials: {
      email: process.env.MARKETING_TEST_EMAIL || 'test@example.com',
      password: process.env.MARKETING_TEST_PASSWORD || 'password123',
    },
  }),
  generic: () => ({
    name: process.env.APP_NAME || 'GenericApp',
    baseUrl: process.env.APP_BASE_URL || 'http://localhost:3000',
    apiUrl: process.env.APP_API_URL || 'http://localhost:8000',
    credentials: {
      email: process.env.APP_TEST_EMAIL || 'test@example.com',
      password: process.env.APP_TEST_PASSWORD || 'password123',
    },
  }),
};

export function getAppConfig(appName: string): AppConfig {
  const factory = APP_CONFIGS[appName.toLowerCase()];
  if (!factory) {
    // Fall back to generic with env overrides
    return APP_CONFIGS.generic();
  }
  return factory();
}

export function getAgentConfig(): AgentConfig {
  return {
    headless: process.env.HEADLESS !== 'false',
    screenshotOnBugOnly: process.env.SCREENSHOT_ON_BUG_ONLY !== 'false',
    videoOnFailure: process.env.VIDEO_ON_FAILURE === 'true',
    reportOutput: process.env.REPORT_OUTPUT || './reports',
    timeoutMs: parseInt(process.env.TIMEOUT_MS || '30000', 10),
    retryCount: parseInt(process.env.RETRY_COUNT || '1', 10),
    crawlScreens: process.env.CRAWL_SCREENS === 'true',
  };
}

export function registerApp(name: string, configFactory: () => AppConfig): void {
  APP_CONFIGS[name.toLowerCase()] = configFactory;
}

export function getRegisteredApps(): string[] {
  return Object.keys(APP_CONFIGS);
}

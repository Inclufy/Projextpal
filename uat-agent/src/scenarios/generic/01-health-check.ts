import type { Scenario } from '../../core/types.js';

/**
 * Generic health check scenario that works with any web application.
 * Tests basic page loading, API health, and authentication flow.
 *
 * To adapt for a new app:
 * 1. Set environment variables (APP_BASE_URL, APP_API_URL, etc.)
 * 2. Or register a custom app config via registerApp()
 */
const scenario: Scenario = {
  id: 'gen-01-health',
  name: 'Generic - Application Health Check',
  app: 'generic',
  description: 'Basic health check for any web application',
  tags: ['health', 'smoke', 'generic'],
  steps: [
    {
      name: 'Verify frontend loads',
      action: async (ctx) => {
        const response = await ctx.page.goto(ctx.app.baseUrl, {
          waitUntil: 'networkidle',
          timeout: 30000,
        });
        if (!response || !response.ok()) {
          throw new Error(`Frontend returned ${response?.status() || 'no response'}`);
        }
        const title = await ctx.page.title();
        ctx.log(`Frontend loaded: "${title}" (${response.status()})`);
      },
    },
    {
      name: 'Check for JavaScript errors',
      action: async (ctx) => {
        const errors: string[] = [];
        ctx.page.on('pageerror', (err: Error) => errors.push(err.message));
        await ctx.page.goto(ctx.app.baseUrl);
        await ctx.page.waitForTimeout(3000);
        if (errors.length > 0) {
          ctx.log(`JS errors found: ${errors.length}`);
          errors.forEach((e) => ctx.log(`  - ${e.substring(0, 100)}`));
        } else {
          ctx.log('No JavaScript errors detected');
        }
      },
    },
    {
      name: 'Verify API responds',
      action: async (ctx) => {
        try {
          // Try common health endpoints
          for (const path of ['/health/', '/api/health', '/health', '/api/v1/health/']) {
            try {
              const res = await ctx.api.get(path);
              if (res.ok) {
                ctx.log(`API health OK at ${path} (${res.status})`);
                return;
              }
            } catch {
              continue;
            }
          }
          // Try root API
          const rootRes = await ctx.api.get('/');
          ctx.log(`API root: ${rootRes.status}`);
        } catch (err: any) {
          ctx.log(`API may not be running: ${err.message}`);
        }
      },
    },
    {
      name: 'Check login page exists',
      action: async (ctx) => {
        for (const path of ['/login', '/auth/login', '/signin', '/auth/signin']) {
          await ctx.page.goto(`${ctx.app.baseUrl}${path}`);
          const hasForm = await ctx.page.locator(
            'input[type="email"], input[type="text"][name*="user"], input[name*="email"]'
          ).count();
          if (hasForm > 0) {
            ctx.log(`Login page found at ${path}`);
            ctx.data.loginPath = path;
            return;
          }
        }
        ctx.log('No standard login page found');
      },
    },
    {
      name: 'Verify responsive meta tag',
      action: async (ctx) => {
        await ctx.page.goto(ctx.app.baseUrl);
        const viewport = await ctx.page.locator('meta[name="viewport"]').count();
        ctx.log(`Viewport meta tag: ${viewport > 0 ? 'present' : 'missing'}`);
      },
    },
  ],
};

export default scenario;

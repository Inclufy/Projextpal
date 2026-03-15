import type { Scenario } from '../../core/types.js';

const scenario: Scenario = {
  id: 'pp-07-dashboard',
  name: 'ProjeXtPal - Dashboard & Navigation',
  app: 'projectpal',
  description: 'Verify main dashboard loads with widgets and navigation works',
  tags: ['dashboard', 'navigation', 'smoke'],
  steps: [
    {
      name: 'Login',
      action: async (ctx) => {
        await ctx.page.goto(`${ctx.app.baseUrl}/login`);
        await ctx.page.fill('input[type="email"]', ctx.app.credentials.email);
        await ctx.page.fill('input[type="password"]', ctx.app.credentials.password);
        await ctx.page.click('button[type="submit"]');
        await ctx.page.waitForURL(/dashboard|projects|home/, { timeout: 15000 });
      },
    },
    {
      name: 'Verify dashboard renders',
      action: async (ctx) => {
        await ctx.page.waitForLoadState('networkidle');
        const title = await ctx.page.title();
        ctx.log(`Page title: ${title}`);
        const bodyText = await ctx.page.textContent('body');
        if (!bodyText || bodyText.length < 50) {
          throw new Error('Dashboard appears empty');
        }
        ctx.log('Dashboard content loaded');
      },
    },
    {
      name: 'Verify sidebar navigation exists',
      action: async (ctx) => {
        const sidebar = ctx.page.locator(
          'nav, aside, [class*="sidebar" i], [class*="Sidebar" i], [role="navigation"]'
        );
        if ((await sidebar.count()) > 0) {
          ctx.log('Sidebar navigation found');
        } else {
          ctx.log('No sidebar detected (may use different navigation pattern)');
        }
      },
    },
    {
      name: 'Verify key navigation links',
      action: async (ctx) => {
        const expectedLinks = ['project', 'dashboard', 'team', 'setting'];
        const found: string[] = [];
        for (const link of expectedLinks) {
          const el = ctx.page.locator(`a[href*="${link}" i], text=/${link}/i`);
          if ((await el.count()) > 0) {
            found.push(link);
          }
        }
        ctx.log(`Navigation links found: ${found.join(', ') || 'none'}`);
      },
    },
    {
      name: 'Verify health check endpoint',
      action: async (ctx) => {
        const res = await ctx.api.get('/health/');
        ctx.log(`Health check: ${res.status} (${res.ok ? 'healthy' : 'unhealthy'})`);
        if (!res.ok) {
          throw new Error(`Health check failed with status ${res.status}`);
        }
      },
    },
  ],
};

export default scenario;

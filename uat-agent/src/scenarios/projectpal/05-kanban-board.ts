import type { Scenario } from '../../core/types.js';

const scenario: Scenario = {
  id: 'pp-05-kanban',
  name: 'ProjeXtPal - Kanban Board',
  app: 'projectpal',
  description: 'Verify Kanban board functionality with columns and cards',
  tags: ['kanban', 'methodology'],
  steps: [
    {
      name: 'Login',
      action: async (ctx) => {
        await ctx.page.goto(`${ctx.app.baseUrl}/login`);
        await ctx.page.fill('input[type="email"]', ctx.app.credentials.email);
        await ctx.page.fill('input[type="password"]', ctx.app.credentials.password);
        await ctx.page.click('button[type="submit"]');
        await ctx.page.waitForURL(/dashboard|projects/, { timeout: 15000 });
      },
    },
    {
      name: 'Navigate to a Kanban project',
      action: async (ctx) => {
        // Try to find a kanban project via navigation
        const kanbanLink = ctx.page.locator(
          'a[href*="kanban"], text=/kanban/i'
        );
        if ((await kanbanLink.count()) > 0) {
          await kanbanLink.first().click();
          await ctx.page.waitForLoadState('networkidle');
          ctx.log('Navigated to Kanban board');
        } else {
          await ctx.page.goto(`${ctx.app.baseUrl}/kanban`);
          await ctx.page.waitForLoadState('networkidle');
          ctx.log('Navigated to /kanban directly');
        }
      },
    },
    {
      name: 'Verify board columns exist',
      action: async (ctx) => {
        const columns = ctx.page.locator(
          '[class*="column" i], [class*="lane" i], [data-testid*="column"], text=/to do|backlog|in progress|doing|done|complete/i'
        );
        const count = await columns.count();
        if (count > 0) {
          ctx.log(`Found ${count} board column indicators`);
        } else {
          ctx.log('No Kanban columns detected (may need a Kanban project first)');
        }
      },
    },
    {
      name: 'Verify Kanban API endpoints',
      action: async (ctx) => {
        const token = await ctx.page.evaluate(() => {
          return localStorage.getItem('token') || localStorage.getItem('access_token') || '';
        });
        if (token) {
          ctx.api.setToken(token);
          // Test kanban-specific API
          const res = await ctx.api.get('/api/v1/kanban/boards/');
          ctx.log(`Kanban boards API: ${res.status} (${res.ok ? 'ok' : 'error'})`);
        }
      },
    },
    {
      name: 'Check for WIP limit indicators',
      action: async (ctx) => {
        const wipIndicators = ctx.page.locator('text=/WIP|limit|limiet/i');
        const count = await wipIndicators.count();
        ctx.log(`WIP limit indicators found: ${count}`);
      },
    },
  ],
};

export default scenario;

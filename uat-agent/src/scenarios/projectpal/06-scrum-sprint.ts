import type { Scenario } from '../../core/types.js';

const scenario: Scenario = {
  id: 'pp-06-scrum',
  name: 'ProjeXtPal - Scrum Sprint Management',
  app: 'projectpal',
  description: 'Verify Scrum sprint board and backlog functionality',
  tags: ['scrum', 'methodology'],
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
      name: 'Navigate to Scrum board',
      action: async (ctx) => {
        const scrumLink = ctx.page.locator('a[href*="scrum"], text=/scrum|sprint/i');
        if ((await scrumLink.count()) > 0) {
          await scrumLink.first().click();
          await ctx.page.waitForLoadState('networkidle');
          ctx.log('Navigated to Scrum board');
        } else {
          await ctx.page.goto(`${ctx.app.baseUrl}/scrum`);
          await ctx.page.waitForLoadState('networkidle');
          ctx.log('Navigated to /scrum directly');
        }
      },
    },
    {
      name: 'Verify sprint board elements',
      action: async (ctx) => {
        const sprintElements = ctx.page.locator(
          'text=/sprint|backlog|story point|velocity/i'
        );
        const count = await sprintElements.count();
        ctx.log(`Sprint-related elements found: ${count}`);
      },
    },
    {
      name: 'Verify Scrum API endpoints',
      action: async (ctx) => {
        const token = await ctx.page.evaluate(() => {
          return localStorage.getItem('token') || localStorage.getItem('access_token') || '';
        });
        if (token) {
          ctx.api.setToken(token);
          const res = await ctx.api.get('/api/v1/scrum/boards/');
          ctx.log(`Scrum boards API: ${res.status} (${res.ok ? 'ok' : 'error'})`);
        }
      },
    },
  ],
};

export default scenario;

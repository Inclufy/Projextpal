import type { Scenario } from '../../core/types.js';

const scenario: Scenario = {
  id: 'mkt-01-login',
  name: 'Marketing - Login Authentication',
  app: 'marketing',
  description: 'Test login flow for Inclufy Marketing',
  tags: ['auth', 'smoke', 'critical'],
  steps: [
    {
      name: 'Navigate to login page',
      action: async (ctx) => {
        await ctx.page.goto(`${ctx.app.baseUrl}/login`);
        await ctx.page.waitForLoadState('networkidle');
        ctx.log('Login page loaded');
      },
    },
    {
      name: 'Fill login form',
      action: async (ctx) => {
        await ctx.page.fill('input[type="email"], input[name="email"], #email', ctx.app.credentials.email);
        await ctx.page.fill('input[type="password"], input[name="password"], #password', ctx.app.credentials.password);
        ctx.log('Credentials entered');
      },
    },
    {
      name: 'Submit login',
      action: async (ctx) => {
        await ctx.page.click('button[type="submit"]');
        await ctx.page.waitForURL(/dashboard|home|campaigns/, { timeout: 15000 });
        ctx.log(`Logged in, redirected to: ${ctx.page.url()}`);
      },
    },
  ],
};

export default scenario;

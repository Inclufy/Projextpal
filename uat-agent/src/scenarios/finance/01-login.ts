import type { Scenario } from '../../core/types.js';

const scenario: Scenario = {
  id: 'fin-01-login',
  name: 'Finance - Login Authentication',
  app: 'finance',
  description: 'Test login flow for Inclufy Finance',
  tags: ['auth', 'smoke', 'critical'],
  steps: [
    {
      name: 'Navigate to login page',
      action: async (ctx) => {
        // Inclufy Finance uses /auth for login (not /login)
        await ctx.page.goto(`${ctx.app.baseUrl}/auth`);
        await ctx.page.waitForLoadState('networkidle');
        ctx.log('Login page loaded');
      },
    },
    {
      name: 'Fill login form',
      action: async (ctx) => {
        // Finance login inputs use id selectors: #email and #password
        await ctx.page.fill('#email', ctx.app.credentials.email);
        await ctx.page.fill('#password', ctx.app.credentials.password);
        ctx.log('Credentials entered');
      },
    },
    {
      name: 'Submit login',
      action: async (ctx) => {
        await ctx.page.click('button[type="submit"]');
        await ctx.page.waitForURL(/dashboard|home|overview|finance/, { timeout: 15000 });
        ctx.log(`Logged in, redirected to: ${ctx.page.url()}`);
      },
    },
  ],
};

export default scenario;

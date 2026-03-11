import type { Scenario } from '../../core/types.js';

const scenario: Scenario = {
  id: 'pp-01-login',
  name: 'ProjeXtPal - Login & Authentication',
  app: 'projectpal',
  description: 'Verify user can log in, see dashboard, and log out',
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
      name: 'Verify login form is visible',
      action: async (ctx) => {
        const emailInput = ctx.page.locator('input[type="email"]');
        const passwordInput = ctx.page.locator('input[type="password"]');
        const submitBtn = ctx.page.locator('button[type="submit"]');

        await emailInput.waitFor({ state: 'visible', timeout: 10000 });
        await passwordInput.waitFor({ state: 'visible' });
        await submitBtn.waitFor({ state: 'visible' });
        ctx.log('Login form elements visible');
      },
    },
    {
      name: 'Enter credentials and submit',
      action: async (ctx) => {
        await ctx.page.fill('input[type="email"]', ctx.app.credentials.email);
        await ctx.page.fill('input[type="password"]', ctx.app.credentials.password);
        await ctx.page.click('button[type="submit"]');
        ctx.log('Credentials entered, form submitted');
      },
    },
    {
      name: 'Verify redirect to dashboard',
      action: async (ctx) => {
        await ctx.page.waitForURL(/dashboard|projects|home/, { timeout: 15000 });
        ctx.log(`Redirected to: ${ctx.page.url()}`);
      },
    },
    {
      name: 'Verify dashboard content loads',
      action: async (ctx) => {
        await ctx.page.waitForLoadState('networkidle');
        // Check for common dashboard elements
        const body = await ctx.page.textContent('body');
        if (!body || body.length < 100) {
          throw new Error('Dashboard content appears empty');
        }
        ctx.log('Dashboard content loaded successfully');
      },
    },
    {
      name: 'Verify user session via API',
      action: async (ctx) => {
        // Try to get auth token from localStorage or cookies
        const token = await ctx.page.evaluate(() => {
          return localStorage.getItem('token') || localStorage.getItem('access_token') || '';
        });
        if (token) {
          ctx.api.setToken(token);
          const response = await ctx.api.get('/api/v1/users/me/');
          if (!response.ok) {
            throw new Error(`User API returned ${response.status}`);
          }
          ctx.data.authToken = token;
          ctx.data.user = response.data;
          ctx.log(`Authenticated as: ${response.data.email || response.data.username || 'user'}`);
        } else {
          ctx.log('No token found in localStorage, skipping API verification');
        }
      },
    },
  ],
};

export default scenario;

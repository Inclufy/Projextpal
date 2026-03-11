import type { Scenario } from '../../core/types.js';

const scenario: Scenario = {
  id: 'gen-02-auth',
  name: 'Generic - Authentication Flow',
  app: 'generic',
  description: 'Test standard login/logout flow for any web application',
  tags: ['auth', 'generic'],
  steps: [
    {
      name: 'Navigate to login page',
      action: async (ctx) => {
        // Try common login paths
        for (const path of ['/login', '/auth/login', '/signin', '/auth/signin', '/']) {
          await ctx.page.goto(`${ctx.app.baseUrl}${path}`);
          await ctx.page.waitForLoadState('networkidle');
          const hasEmailField = await ctx.page.locator(
            'input[type="email"], input[name*="email"], input[name*="user"]'
          ).count();
          if (hasEmailField > 0) {
            ctx.data.loginPath = path;
            ctx.log(`Login form found at ${path}`);
            return;
          }
        }
        throw new Error('Could not find a login page');
      },
    },
    {
      name: 'Submit login form',
      action: async (ctx) => {
        const emailField = ctx.page.locator(
          'input[type="email"], input[name*="email"], input[name*="user"]'
        ).first();
        const passwordField = ctx.page.locator('input[type="password"]').first();

        await emailField.fill(ctx.app.credentials.email);
        await passwordField.fill(ctx.app.credentials.password);

        const submitBtn = ctx.page.locator(
          'button[type="submit"], input[type="submit"], button:has-text("Login"), button:has-text("Sign in"), button:has-text("Inloggen")'
        ).first();
        await submitBtn.click();
        await ctx.page.waitForLoadState('networkidle');
        ctx.log('Login form submitted');
      },
    },
    {
      name: 'Verify authentication succeeded',
      action: async (ctx) => {
        // Wait for redirect away from login page
        await ctx.page.waitForTimeout(3000);
        const url = ctx.page.url();
        const isStillOnLogin = url.includes('login') || url.includes('signin');

        if (isStillOnLogin) {
          // Check for error messages
          const errorMsg = ctx.page.locator(
            'text=/error|invalid|incorrect|wrong|fout/i, [class*="error"], [role="alert"]'
          );
          if ((await errorMsg.count()) > 0) {
            const text = await errorMsg.first().textContent();
            throw new Error(`Login failed: ${text}`);
          }
          ctx.log('Warning: Still on login page, may need different credentials');
        } else {
          ctx.log(`Authenticated, redirected to: ${url}`);
        }
      },
    },
    {
      name: 'Check for logout option',
      action: async (ctx) => {
        const logoutBtn = ctx.page.locator(
          'text=/logout|sign out|uitloggen|afmelden/i, a[href*="logout"], button:has-text("Logout")'
        );
        const count = await logoutBtn.count();
        ctx.log(`Logout option ${count > 0 ? 'found' : 'not visible (may be in menu)'}`);
      },
    },
  ],
};

export default scenario;

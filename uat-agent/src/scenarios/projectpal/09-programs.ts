import type { Scenario } from '../../core/types.js';

const scenario: Scenario = {
  id: 'pp-09-programs',
  name: 'ProjeXtPal - Program Management',
  app: 'projectpal',
  description: 'Verify program management features (SAFe, MSP, PMI, etc.)',
  tags: ['programs', 'methodology'],
  steps: [
    {
      name: 'Login',
      action: async (ctx) => {
        await ctx.page.goto(`${ctx.app.baseUrl}/login`);
        await ctx.page.fill('input[type="email"]', ctx.app.credentials.email);
        await ctx.page.fill('input[type="password"]', ctx.app.credentials.password);
        await ctx.page.click('button[type="submit"]');
        await ctx.page.waitForURL(/dashboard|projects/, { timeout: 15000 });

        const token = await ctx.page.evaluate(() => {
          return localStorage.getItem('token') || localStorage.getItem('access_token') || '';
        });
        if (token) ctx.api.setToken(token);
      },
    },
    {
      name: 'Navigate to programs',
      action: async (ctx) => {
        const programsLink = ctx.page.locator(
          'a[href*="program"], text=/program/i'
        );
        if ((await programsLink.count()) > 0) {
          await programsLink.first().click();
          await ctx.page.waitForLoadState('networkidle');
          ctx.log('Navigated to programs');
        } else {
          await ctx.page.goto(`${ctx.app.baseUrl}/programs`);
          await ctx.page.waitForLoadState('networkidle');
          ctx.log('Navigated to /programs directly');
        }
      },
    },
    {
      name: 'Verify programs API',
      action: async (ctx) => {
        const res = await ctx.api.get('/api/v1/programs/');
        if (res.ok) {
          const programs = Array.isArray(res.data) ? res.data : res.data.results || [];
          ctx.log(`Programs API returned ${programs.length} programs`);
        } else {
          ctx.log(`Programs API: ${res.status}`);
        }
      },
    },
    {
      name: 'Verify methodologies API',
      action: async (ctx) => {
        const res = await ctx.api.get('/api/v1/projects/methodologies/');
        if (res.ok) {
          const methodologies = Array.isArray(res.data) ? res.data : res.data.results || [];
          ctx.log(`Methodologies: ${methodologies.length} available`);
          if (methodologies.length > 0) {
            const names = methodologies.map((m: any) => m.name || m.code).slice(0, 5);
            ctx.log(`First 5: ${names.join(', ')}`);
          }
        } else {
          ctx.log(`Methodologies API: ${res.status}`);
        }
      },
    },
  ],
};

export default scenario;

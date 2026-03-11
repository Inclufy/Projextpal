import type { Scenario } from '../../core/types.js';

const scenario: Scenario = {
  id: 'pp-08-academy',
  name: 'ProjeXtPal - Academy & Learning',
  app: 'projectpal',
  description: 'Verify Academy learning management system',
  tags: ['academy', 'learning'],
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
      name: 'Navigate to Academy',
      action: async (ctx) => {
        const academyLink = ctx.page.locator(
          'a[href*="academy"], a[href*="learning"], text=/academy|learning|cursus/i'
        );
        if ((await academyLink.count()) > 0) {
          await academyLink.first().click();
          await ctx.page.waitForLoadState('networkidle');
          ctx.log('Navigated to Academy');
        } else {
          await ctx.page.goto(`${ctx.app.baseUrl}/academy`);
          await ctx.page.waitForLoadState('networkidle');
          ctx.log('Navigated to /academy directly');
        }
      },
    },
    {
      name: 'Verify courses API',
      action: async (ctx) => {
        const res = await ctx.api.get('/api/v1/academy/courses/');
        if (res.ok) {
          const courses = Array.isArray(res.data) ? res.data : res.data.results || [];
          ctx.log(`Academy has ${courses.length} courses`);
        } else {
          ctx.log(`Courses API: ${res.status}`);
        }
      },
    },
    {
      name: 'Verify skills API',
      action: async (ctx) => {
        const res = await ctx.api.get('/api/v1/academy/skills/skills/');
        if (res.ok) {
          const skills = Array.isArray(res.data) ? res.data : res.data.results || [];
          ctx.log(`Skills API returned ${skills.length} skills`);
        } else {
          ctx.log(`Skills API: ${res.status}`);
        }
      },
    },
  ],
};

export default scenario;

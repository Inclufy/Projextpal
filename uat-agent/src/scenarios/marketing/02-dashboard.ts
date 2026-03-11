import type { Scenario } from '../../core/types.js';

const scenario: Scenario = {
  id: 'mkt-02-dashboard',
  name: 'Marketing - Dashboard & Analytics',
  app: 'marketing',
  description: 'Verify marketing dashboard loads with key metrics',
  tags: ['dashboard', 'smoke', 'critical'],
  steps: [
    {
      name: 'Navigate to dashboard',
      action: async (ctx) => {
        await ctx.page.goto(`${ctx.app.baseUrl}/dashboard`);
        await ctx.page.waitForLoadState('networkidle');
        ctx.log('Dashboard loaded');
      },
    },
    {
      name: 'Check dashboard content',
      action: async (ctx) => {
        const body = await ctx.page.textContent('body');
        if (!body || body.trim().length < 50) {
          ctx.reportIssue({
            type: 'bug',
            severity: 'major',
            title: 'Dashboard appears empty',
            description: 'Dashboard page has minimal content',
            suggestion: 'Check if dashboard components render correctly.',
          });
          throw new Error('Dashboard appears empty');
        }
        ctx.log(`Dashboard content loaded (${body.length} chars)`);
      },
    },
    {
      name: 'Check marketing metrics',
      action: async (ctx) => {
        const body = (await ctx.page.textContent('body') || '').toLowerCase();
        const metrics = ['campaign', 'leads', 'conversion', 'analytics', 'reach', 'engagement', 'roi', 'traffic'];
        const found = metrics.filter(m => body.includes(m));
        ctx.log(`Marketing metrics found: ${found.length > 0 ? found.join(', ') : 'none detected'}`);
      },
    },
  ],
};

export default scenario;

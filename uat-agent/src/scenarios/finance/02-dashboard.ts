import type { Scenario } from '../../core/types.js';

const scenario: Scenario = {
  id: 'fin-02-dashboard',
  name: 'Finance - Dashboard & Overview',
  app: 'finance',
  description: 'Verify finance dashboard loads with key widgets',
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
      name: 'Check dashboard widgets render',
      action: async (ctx) => {
        const body = await ctx.page.textContent('body');
        if (!body || body.trim().length < 50) {
          ctx.reportIssue({
            type: 'bug',
            severity: 'major',
            title: 'Dashboard appears empty',
            description: 'Dashboard page has minimal content',
            suggestion: 'Check if dashboard components render correctly and data loads.',
          });
          throw new Error('Dashboard appears empty');
        }
        ctx.log(`Dashboard content loaded (${body.length} chars)`);
      },
    },
    {
      name: 'Check for financial summary sections',
      action: async (ctx) => {
        const sections = ['revenue', 'expense', 'profit', 'budget', 'invoice', 'balance', 'cash flow', 'overview'];
        const body = (await ctx.page.textContent('body') || '').toLowerCase();
        const found = sections.filter(s => body.includes(s));
        ctx.log(`Financial sections found: ${found.length > 0 ? found.join(', ') : 'none detected'}`);
      },
    },
  ],
};

export default scenario;

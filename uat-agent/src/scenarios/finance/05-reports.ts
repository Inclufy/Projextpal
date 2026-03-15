import type { Scenario } from '../../core/types.js';

const scenario: Scenario = {
  id: 'fin-05-reports',
  name: 'Finance - Financial Reports',
  app: 'finance',
  description: 'Test financial reporting pages',
  tags: ['reports', 'core'],
  steps: [
    {
      name: 'Navigate to reports',
      action: async (ctx) => {
        await ctx.page.goto(`${ctx.app.baseUrl}/reports`);
        await ctx.page.waitForLoadState('networkidle');
        ctx.log('Reports page loaded');
      },
    },
    {
      name: 'Check report types available',
      action: async (ctx) => {
        const body = (await ctx.page.textContent('body') || '').toLowerCase();
        const reportTypes = ['profit & loss', 'p&l', 'balance sheet', 'cash flow', 'income', 'expense', 'budget', 'tax'];
        const found = reportTypes.filter(r => body.includes(r));
        ctx.log(`Report types found: ${found.length > 0 ? found.join(', ') : 'none detected'}`);
      },
    },
  ],
};

export default scenario;

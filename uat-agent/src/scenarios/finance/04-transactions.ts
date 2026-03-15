import type { Scenario } from '../../core/types.js';

const scenario: Scenario = {
  id: 'fin-04-transactions',
  name: 'Finance - Transactions & Ledger',
  app: 'finance',
  description: 'Test transaction recording and ledger views',
  tags: ['transactions', 'core'],
  steps: [
    {
      name: 'Navigate to transactions',
      action: async (ctx) => {
        const routes = ['/transactions', '/ledger', '/accounting', '/entries'];
        let loaded = false;
        for (const route of routes) {
          await ctx.page.goto(`${ctx.app.baseUrl}${route}`);
          const status = ctx.page.url();
          if (!status.includes('404') && !status.includes('login')) {
            ctx.log(`Transactions page loaded at ${route}`);
            loaded = true;
            break;
          }
        }
        if (!loaded) {
          ctx.log('Transactions page not found at common routes');
        }
      },
    },
    {
      name: 'Check transaction data display',
      action: async (ctx) => {
        await ctx.page.waitForLoadState('networkidle');
        const body = (await ctx.page.textContent('body') || '').toLowerCase();
        const hasFinancialData = ['amount', 'date', 'description', 'category', 'debit', 'credit', 'total'].some(
          term => body.includes(term)
        );
        ctx.log(`Financial data terms found: ${hasFinancialData}`);
      },
    },
  ],
};

export default scenario;

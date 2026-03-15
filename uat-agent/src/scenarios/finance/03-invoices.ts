import type { Scenario } from '../../core/types.js';

const scenario: Scenario = {
  id: 'fin-03-invoices',
  name: 'Finance - Invoice Management',
  app: 'finance',
  description: 'Test invoice CRUD operations',
  tags: ['invoices', 'crud', 'core'],
  steps: [
    {
      name: 'Navigate to invoices',
      action: async (ctx) => {
        await ctx.page.goto(`${ctx.app.baseUrl}/invoices`);
        await ctx.page.waitForLoadState('networkidle');
        ctx.log('Invoices page loaded');
      },
    },
    {
      name: 'Check invoice list renders',
      action: async (ctx) => {
        // Look for table/list elements
        const hasTable = await ctx.page.locator('table, [role="table"], [class*="list"], [class*="grid"]').count();
        ctx.log(`Invoice list elements found: ${hasTable}`);
        if (hasTable === 0) {
          ctx.reportIssue({
            type: 'ui_issue',
            severity: 'minor',
            title: 'No invoice list/table found',
            description: 'Expected a table or list element on the invoices page',
            suggestion: 'Verify the invoices page has a data table or list component.',
          });
        }
      },
    },
    {
      name: 'Check create invoice button',
      action: async (ctx) => {
        const createBtn = ctx.page.locator('button, a').filter({ hasText: /create|new|add/i });
        const count = await createBtn.count();
        ctx.log(`Create/Add buttons found: ${count}`);
      },
    },
  ],
};

export default scenario;

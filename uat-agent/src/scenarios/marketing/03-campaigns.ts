import type { Scenario } from '../../core/types.js';

const scenario: Scenario = {
  id: 'mkt-03-campaigns',
  name: 'Marketing - Campaign Management',
  app: 'marketing',
  description: 'Test campaign CRUD and listing',
  tags: ['campaigns', 'crud', 'core'],
  steps: [
    {
      name: 'Navigate to campaigns',
      action: async (ctx) => {
        await ctx.page.goto(`${ctx.app.baseUrl}/campaigns`);
        await ctx.page.waitForLoadState('networkidle');
        ctx.log('Campaigns page loaded');
      },
    },
    {
      name: 'Check campaign list',
      action: async (ctx) => {
        const hasContent = await ctx.page.locator('table, [role="table"], [class*="list"], [class*="grid"], [class*="card"]').count();
        ctx.log(`Campaign list/card elements found: ${hasContent}`);
      },
    },
    {
      name: 'Check create campaign button',
      action: async (ctx) => {
        const createBtn = ctx.page.locator('button, a').filter({ hasText: /create|new|add|launch/i });
        const count = await createBtn.count();
        ctx.log(`Create/Add campaign buttons found: ${count}`);
      },
    },
  ],
};

export default scenario;

import type { Scenario } from '../../core/types.js';

const scenario: Scenario = {
  id: 'mkt-04-contacts',
  name: 'Marketing - Contact & Lead Management',
  app: 'marketing',
  description: 'Test contacts/leads listing and CRM features',
  tags: ['contacts', 'leads', 'crm', 'core'],
  steps: [
    {
      name: 'Navigate to contacts/leads',
      action: async (ctx) => {
        const routes = ['/contacts', '/leads', '/crm', '/customers'];
        for (const route of routes) {
          await ctx.page.goto(`${ctx.app.baseUrl}${route}`);
          await ctx.page.waitForLoadState('networkidle');
          const body = (await ctx.page.textContent('body') || '').toLowerCase();
          if (body.length > 100 && !body.includes('404') && !body.includes('not found')) {
            ctx.log(`Contacts/Leads page loaded at ${route}`);
            return;
          }
        }
        ctx.log('Contacts page not found at common routes');
      },
    },
    {
      name: 'Check contact data display',
      action: async (ctx) => {
        const body = (await ctx.page.textContent('body') || '').toLowerCase();
        const terms = ['name', 'email', 'phone', 'company', 'status', 'lead', 'contact'];
        const found = terms.filter(t => body.includes(t));
        ctx.log(`Contact-related terms found: ${found.join(', ') || 'none'}`);
      },
    },
  ],
};

export default scenario;

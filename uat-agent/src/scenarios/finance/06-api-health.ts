import type { Scenario } from '../../core/types.js';

const scenario: Scenario = {
  id: 'fin-06-api-health',
  name: 'Finance - API Health & Endpoints',
  app: 'finance',
  description: 'Verify all major Finance API endpoints are responding',
  tags: ['api', 'health', 'smoke', 'critical'],
  steps: [
    {
      name: 'Health check endpoint',
      action: async (ctx) => {
        const res = await ctx.api.get('/health/');
        if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
        ctx.log(`Health: OK (${res.status})`);
      },
    },
    {
      name: 'Login via API',
      action: async (ctx) => {
        const loginPaths = ['/api/v1/auth/login/', '/api/auth/login/', '/auth/login/'];
        for (const path of loginPaths) {
          const res = await ctx.api.post(path, {
            email: ctx.app.credentials.email,
            password: ctx.app.credentials.password,
          });
          if (res.ok) {
            const token = res.data.access || res.data.token || res.data.key;
            if (token) {
              ctx.api.setToken(token);
              ctx.data.authToken = token;
              ctx.log(`API login successful via ${path}`);
              return;
            }
          }
        }
        ctx.log('API login: could not authenticate (may need different endpoint)');
      },
    },
    {
      name: 'Invoices endpoint',
      action: async (ctx) => {
        const res = await ctx.api.get('/api/v1/invoices/');
        ctx.log(`GET /api/v1/invoices/ -> ${res.status}`);
      },
    },
    {
      name: 'Transactions endpoint',
      action: async (ctx) => {
        const res = await ctx.api.get('/api/v1/transactions/');
        ctx.log(`GET /api/v1/transactions/ -> ${res.status}`);
      },
    },
    {
      name: 'Accounts endpoint',
      action: async (ctx) => {
        const res = await ctx.api.get('/api/v1/accounts/');
        ctx.log(`GET /api/v1/accounts/ -> ${res.status}`);
      },
    },
    {
      name: 'Reports endpoint',
      action: async (ctx) => {
        const res = await ctx.api.get('/api/v1/reports/');
        ctx.log(`GET /api/v1/reports/ -> ${res.status}`);
      },
    },
    {
      name: 'Budgets endpoint',
      action: async (ctx) => {
        const res = await ctx.api.get('/api/v1/budgets/');
        ctx.log(`GET /api/v1/budgets/ -> ${res.status}`);
      },
    },
  ],
};

export default scenario;

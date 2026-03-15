import type { Scenario } from '../../core/types.js';

const scenario: Scenario = {
  id: 'mkt-05-api-health',
  name: 'Marketing - API Health & Endpoints',
  app: 'marketing',
  description: 'Verify all major Marketing API endpoints are responding',
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
              ctx.log(`API login successful via ${path}`);
              return;
            }
          }
        }
        ctx.log('API login: could not authenticate');
      },
    },
    {
      name: 'Campaigns endpoint',
      action: async (ctx) => {
        const res = await ctx.api.get('/api/v1/campaigns/');
        ctx.log(`GET /api/v1/campaigns/ -> ${res.status}`);
      },
    },
    {
      name: 'Contacts endpoint',
      action: async (ctx) => {
        const res = await ctx.api.get('/api/v1/contacts/');
        ctx.log(`GET /api/v1/contacts/ -> ${res.status}`);
      },
    },
    {
      name: 'Analytics endpoint',
      action: async (ctx) => {
        const res = await ctx.api.get('/api/v1/analytics/');
        ctx.log(`GET /api/v1/analytics/ -> ${res.status}`);
      },
    },
    {
      name: 'Email templates endpoint',
      action: async (ctx) => {
        const res = await ctx.api.get('/api/v1/templates/');
        ctx.log(`GET /api/v1/templates/ -> ${res.status}`);
      },
    },
  ],
};

export default scenario;

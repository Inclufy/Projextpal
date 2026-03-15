import type { Scenario } from '../../core/types.js';

const scenario: Scenario = {
  id: 'pp-10-api-health',
  name: 'ProjeXtPal - API Health & Endpoints',
  app: 'projectpal',
  description: 'Verify all major API endpoints are responding',
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
        const res = await ctx.api.post('/api/v1/auth/login/', {
          email: ctx.app.credentials.email,
          password: ctx.app.credentials.password,
        });
        if (res.ok) {
          const token = res.data.access || res.data.token || res.data.key;
          if (token) {
            ctx.api.setToken(token);
            ctx.data.authToken = token;
            ctx.log('API login successful');
          } else {
            ctx.log(`Login response has no token: ${JSON.stringify(res.data).substring(0, 100)}`);
          }
        } else {
          ctx.log(`Login API: ${res.status} - ${JSON.stringify(res.data).substring(0, 100)}`);
        }
      },
    },
    {
      name: 'Projects endpoint',
      action: async (ctx) => {
        const res = await ctx.api.get('/api/v1/projects/');
        ctx.log(`GET /api/v1/projects/ → ${res.status}`);
      },
    },
    {
      name: 'Programs endpoint',
      action: async (ctx) => {
        const res = await ctx.api.get('/api/v1/programs/');
        ctx.log(`GET /api/v1/programs/ → ${res.status}`);
      },
    },
    {
      name: 'Tasks endpoint',
      action: async (ctx) => {
        const res = await ctx.api.get('/api/v1/projects/tasks/');
        ctx.log(`GET /api/v1/projects/tasks/ → ${res.status}`);
      },
    },
    {
      name: 'Milestones endpoint',
      action: async (ctx) => {
        const res = await ctx.api.get('/api/v1/projects/milestones/');
        ctx.log(`GET /api/v1/projects/milestones/ → ${res.status}`);
      },
    },
    {
      name: 'Bot/Chat endpoint',
      action: async (ctx) => {
        const res = await ctx.api.get('/api/v1/bot/chats/');
        ctx.log(`GET /api/v1/bot/chats/ → ${res.status}`);
      },
    },
    {
      name: 'Academy endpoint',
      action: async (ctx) => {
        const res = await ctx.api.get('/api/v1/academy/courses/');
        ctx.log(`GET /api/v1/academy/courses/ → ${res.status}`);
      },
    },
    {
      name: 'Governance endpoint',
      action: async (ctx) => {
        const res = await ctx.api.get('/api/v1/governance/');
        ctx.log(`GET /api/v1/governance/ → ${res.status}`);
      },
    },
    {
      name: 'Subscriptions endpoint',
      action: async (ctx) => {
        const res = await ctx.api.get('/api/v1/subscriptions/');
        ctx.log(`GET /api/v1/subscriptions/ → ${res.status}`);
      },
    },
    {
      name: 'API schema/docs endpoint',
      action: async (ctx) => {
        const res = await ctx.api.get('/api/schema/');
        ctx.log(`GET /api/schema/ → ${res.status}`);
      },
    },
  ],
};

export default scenario;

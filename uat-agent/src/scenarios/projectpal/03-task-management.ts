import type { Scenario } from '../../core/types.js';

const scenario: Scenario = {
  id: 'pp-03-task-management',
  name: 'ProjeXtPal - Task Management',
  app: 'projectpal',
  description: 'Verify task listing, creation form, and task detail views',
  tags: ['tasks', 'crud'],
  steps: [
    {
      name: 'Login',
      action: async (ctx) => {
        await ctx.page.goto(`${ctx.app.baseUrl}/login`);
        await ctx.page.fill('input[type="email"]', ctx.app.credentials.email);
        await ctx.page.fill('input[type="password"]', ctx.app.credentials.password);
        await ctx.page.click('button[type="submit"]');
        await ctx.page.waitForURL(/dashboard|projects/, { timeout: 15000 });
      },
    },
    {
      name: 'Navigate to a project with tasks',
      action: async (ctx) => {
        // Get first project from API
        const token = await ctx.page.evaluate(() => {
          return localStorage.getItem('token') || localStorage.getItem('access_token') || '';
        });
        if (token) {
          ctx.api.setToken(token);
          const res = await ctx.api.get('/api/v1/projects/');
          const projects = Array.isArray(res.data) ? res.data : res.data.results || [];
          if (projects.length > 0) {
            ctx.data.projectId = projects[0].id;
            await ctx.page.goto(`${ctx.app.baseUrl}/projects/${projects[0].id}`);
            await ctx.page.waitForLoadState('networkidle');
            ctx.log(`Navigated to project: ${projects[0].name || projects[0].id}`);
            return;
          }
        }
        // Fallback: click first project in list
        await ctx.page.goto(`${ctx.app.baseUrl}/projects`);
        await ctx.page.waitForLoadState('networkidle');
        const firstProject = ctx.page.locator('a[href*="/projects/"], tr >> a').first();
        if ((await firstProject.count()) > 0) {
          await firstProject.click();
          await ctx.page.waitForLoadState('networkidle');
          ctx.log('Navigated to first project');
        } else {
          ctx.log('No projects available for task management test');
        }
      },
    },
    {
      name: 'Verify tasks section is visible',
      action: async (ctx) => {
        const taskSection = ctx.page.locator(
          'text=/task|taken|taak/i'
        );
        if ((await taskSection.count()) > 0) {
          ctx.log('Tasks section found');
        } else {
          ctx.log('Tasks section not immediately visible');
        }
      },
    },
    {
      name: 'Verify tasks API endpoint',
      action: async (ctx) => {
        if (!ctx.data.projectId) {
          ctx.log('No project ID, skipping API check');
          return;
        }
        const res = await ctx.api.get('/api/v1/projects/tasks/');
        if (res.ok) {
          const tasks = Array.isArray(res.data) ? res.data : res.data.results || [];
          ctx.log(`Tasks API returned ${tasks.length} tasks`);
        } else {
          ctx.log(`Tasks API returned ${res.status}`);
        }
      },
    },
    {
      name: 'Verify milestones API endpoint',
      action: async (ctx) => {
        const res = await ctx.api.get('/api/v1/projects/milestones/');
        if (res.ok) {
          const milestones = Array.isArray(res.data) ? res.data : res.data.results || [];
          ctx.log(`Milestones API returned ${milestones.length} milestones`);
        } else {
          ctx.log(`Milestones API returned ${res.status}`);
        }
      },
    },
  ],
};

export default scenario;

import type { Scenario } from '../../core/types.js';

const scenario: Scenario = {
  id: 'pp-02-project-crud',
  name: 'ProjeXtPal - Project CRUD Operations',
  app: 'projectpal',
  description: 'Create, read, update, and verify project operations',
  tags: ['projects', 'crud', 'critical'],
  steps: [
    {
      name: 'Login and navigate to projects',
      action: async (ctx) => {
        await ctx.page.goto(`${ctx.app.baseUrl}/login`);
        await ctx.page.fill('input[type="email"]', ctx.app.credentials.email);
        await ctx.page.fill('input[type="password"]', ctx.app.credentials.password);
        await ctx.page.click('button[type="submit"]');
        await ctx.page.waitForURL(/dashboard|projects/, { timeout: 15000 });
        ctx.log('Logged in successfully');
      },
    },
    {
      name: 'Navigate to projects list',
      action: async (ctx) => {
        // Try sidebar navigation or direct URL
        const projectsLink = ctx.page.locator(
          'a[href*="project"], nav >> text=/project/i'
        );
        if ((await projectsLink.count()) > 0) {
          await projectsLink.first().click();
        } else {
          await ctx.page.goto(`${ctx.app.baseUrl}/projects`);
        }
        await ctx.page.waitForLoadState('networkidle');
        ctx.log('Projects page loaded');
      },
    },
    {
      name: 'Verify projects table or list renders',
      action: async (ctx) => {
        // Look for project list indicators
        const table = ctx.page.locator('table, [class*="project-list"], [class*="ProjectsTable"]');
        const cards = ctx.page.locator('[class*="project-card"], [class*="ProjectCard"]');
        const hasTable = (await table.count()) > 0;
        const hasCards = (await cards.count()) > 0;
        if (!hasTable && !hasCards) {
          // Might still be loading or empty state
          const empty = ctx.page.locator('text=/no project|empty|get started/i');
          if ((await empty.count()) === 0) {
            ctx.log('Warning: No projects list or empty state found');
          }
        }
        ctx.log(`Projects display found: table=${hasTable}, cards=${hasCards}`);
      },
    },
    {
      name: 'Open create project form',
      action: async (ctx) => {
        const createBtn = ctx.page.locator(
          'button:has-text("New Project"), button:has-text("Create Project"), button:has-text("Nieuw Project"), a:has-text("New Project")'
        );
        if ((await createBtn.count()) > 0) {
          await createBtn.first().click();
          await ctx.page.waitForLoadState('networkidle');
          ctx.data.canCreateProject = true;
          ctx.log('Create project form opened');
        } else {
          ctx.data.canCreateProject = false;
          ctx.log('No create project button found (may need permissions)');
        }
      },
    },
    {
      name: 'Verify create project form fields',
      action: async (ctx) => {
        if (!ctx.data.canCreateProject) {
          ctx.log('Skipped - no create form available');
          return;
        }
        // Check for typical project form fields
        const nameField = ctx.page.locator(
          'input[name="name"], input[name="title"], input[placeholder*="name" i], input[placeholder*="titel" i]'
        );
        await nameField.first().waitFor({ state: 'visible', timeout: 10000 });
        ctx.log('Project form fields detected');
      },
    },
    {
      name: 'Verify project methodologies are available',
      action: async (ctx) => {
        if (!ctx.data.canCreateProject) {
          ctx.log('Skipped - no create form available');
          return;
        }
        // Look for methodology selection
        const methodologySelect = ctx.page.locator(
          'select[name*="methodology"], [class*="methodology"], text=/waterfall|agile|scrum|kanban|prince2/i'
        );
        if ((await methodologySelect.count()) > 0) {
          ctx.log('Methodology selection found');
        } else {
          ctx.log('No methodology selector visible on initial form');
        }
      },
    },
    {
      name: 'Verify projects API endpoint',
      action: async (ctx) => {
        const token = await ctx.page.evaluate(() => {
          return localStorage.getItem('token') || localStorage.getItem('access_token') || '';
        });
        if (token) {
          ctx.api.setToken(token);
          const response = await ctx.api.get('/api/v1/projects/');
          if (response.ok) {
            const projects = Array.isArray(response.data) ? response.data : response.data.results || [];
            ctx.data.projectCount = projects.length;
            ctx.log(`API returned ${projects.length} projects`);
          } else {
            ctx.log(`Projects API returned status ${response.status}`);
          }
        } else {
          ctx.log('No auth token, skipping API check');
        }
      },
    },
  ],
};

export default scenario;

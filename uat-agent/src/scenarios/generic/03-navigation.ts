import type { Scenario } from '../../core/types.js';

const scenario: Scenario = {
  id: 'gen-03-navigation',
  name: 'Generic - Navigation & Page Structure',
  app: 'generic',
  description: 'Verify main navigation, page structure, and accessibility basics',
  tags: ['navigation', 'a11y', 'generic'],
  steps: [
    {
      name: 'Load main page',
      action: async (ctx) => {
        await ctx.page.goto(ctx.app.baseUrl);
        await ctx.page.waitForLoadState('networkidle');
        ctx.log('Main page loaded');
      },
    },
    {
      name: 'Check navigation structure',
      action: async (ctx) => {
        const nav = await ctx.page.locator('nav, [role="navigation"]').count();
        const header = await ctx.page.locator('header, [role="banner"]').count();
        const main = await ctx.page.locator('main, [role="main"]').count();
        ctx.log(`Structure: nav=${nav}, header=${header}, main=${main}`);
      },
    },
    {
      name: 'Count navigation links',
      action: async (ctx) => {
        const links = await ctx.page.locator('nav a, [role="navigation"] a').count();
        ctx.log(`Navigation links: ${links}`);
      },
    },
    {
      name: 'Check page accessibility basics',
      action: async (ctx) => {
        const hasLang = await ctx.page.locator('html[lang]').count();
        const hasTitle = (await ctx.page.title()).length > 0;
        const h1Count = await ctx.page.locator('h1').count();
        const imgWithoutAlt = await ctx.page.locator('img:not([alt])').count();

        ctx.log(
          `A11y basics: lang=${hasLang > 0}, title=${hasTitle}, h1=${h1Count}, img-no-alt=${imgWithoutAlt}`
        );
        if (imgWithoutAlt > 0) {
          ctx.log(`Warning: ${imgWithoutAlt} images without alt text`);
        }
      },
    },
    {
      name: 'Verify no broken images',
      action: async (ctx) => {
        const images = await ctx.page.locator('img[src]').all();
        let broken = 0;
        for (const img of images.slice(0, 20)) {
          const naturalWidth = await img.evaluate(
            (el: any) => el.naturalWidth
          );
          if (naturalWidth === 0) broken++;
        }
        ctx.log(
          `Images checked: ${Math.min(images.length, 20)}, broken: ${broken}`
        );
      },
    },
  ],
};

export default scenario;

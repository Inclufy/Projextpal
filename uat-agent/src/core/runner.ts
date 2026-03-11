import { chromium, type Browser } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';
import { createApiClient } from './api-client.js';
import type {
  Scenario,
  ScenarioContext,
  ScenarioResult,
  StepResult,
  TestReport,
  AppConfig,
  AgentConfig,
  Issue,
  PageAudit,
} from './types.js';

export class TestRunner {
  private browser: Browser | null = null;
  private scenarios: Scenario[] = [];
  private appConfig: AppConfig;
  private agentConfig: AgentConfig;
  private onStepLog: (scenarioId: string, message: string) => void;
  private allIssues: Issue[] = [];
  private pageAudits: PageAudit[] = [];

  constructor(
    appConfig: AppConfig,
    agentConfig: AgentConfig,
    onStepLog?: (scenarioId: string, message: string) => void
  ) {
    this.appConfig = appConfig;
    this.agentConfig = agentConfig;
    this.onStepLog = onStepLog || (() => {});
  }

  addScenario(scenario: Scenario): void {
    this.scenarios.push(scenario);
  }

  addScenarios(scenarios: Scenario[]): void {
    this.scenarios.push(...scenarios);
  }

  private ensureScreenshotDir(): void {
    const dir = resolve(this.agentConfig.reportOutput, 'screenshots');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  async run(filter?: { ids?: string[]; tags?: string[] }): Promise<TestReport> {
    const startedAt = new Date().toISOString();
    const startTime = Date.now();
    this.allIssues = [];
    this.pageAudits = [];

    this.ensureScreenshotDir();

    this.browser = await chromium.launch({
      headless: this.agentConfig.headless,
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
      args: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? ['--no-sandbox', '--disable-gpu'] : [],
    });

    let scenariosToRun = this.scenarios;
    if (filter?.ids?.length) {
      scenariosToRun = scenariosToRun.filter((s) => filter.ids!.includes(s.id));
    }
    if (filter?.tags?.length) {
      scenariosToRun = scenariosToRun.filter((s) =>
        s.tags.some((t) => filter.tags!.includes(t))
      );
    }

    const results: ScenarioResult[] = [];

    for (const scenario of scenariosToRun) {
      const result = await this.runScenario(scenario);
      results.push(result);
      this.allIssues.push(...result.issues);
    }

    // Crawl screens if enabled
    if (this.agentConfig.crawlScreens) {
      await this.crawlAllScreens();
    }

    await this.browser.close();
    this.browser = null;

    const finishedAt = new Date().toISOString();
    const duration = Date.now() - startTime;

    return {
      agent: 'inclufy-uat-agent',
      version: '1.0.0',
      app: this.appConfig.name,
      environment: this.appConfig.baseUrl,
      startedAt,
      finishedAt,
      duration,
      summary: {
        total: results.length,
        passed: results.filter((r) => r.status === 'passed').length,
        failed: results.filter((r) => r.status === 'failed').length,
        skipped: results.filter((r) => r.status === 'skipped').length,
        issuesFound: this.allIssues.length,
        bugCount: this.allIssues.filter((i) => i.type === 'bug').length,
        missingFeatureCount: this.allIssues.filter((i) => i.type === 'missing_feature').length,
      },
      scenarios: results,
      pageAudits: this.pageAudits,
      allIssues: this.allIssues,
    };
  }

  private async runScenario(scenario: Scenario): Promise<ScenarioResult> {
    const startedAt = new Date().toISOString();
    const startTime = Date.now();
    const steps: StepResult[] = [];
    const issues: Issue[] = [];
    let scenarioStatus: 'passed' | 'failed' | 'skipped' = 'passed';

    const context = await this.browser!.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
    });
    const page = await context.newPage();
    page.setDefaultTimeout(this.agentConfig.timeoutMs);

    // Capture console errors
    const consoleErrors: string[] = [];
    page.on('console', (msg: any) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', (err: Error) => {
      consoleErrors.push(err.message);
      issues.push({
        type: 'console_error',
        severity: 'major',
        title: `JS Error: ${err.message.substring(0, 80)}`,
        description: err.message,
        page: page.url(),
        suggestion: 'Check browser console for stack trace and fix the JavaScript error.',
      });
    });

    const api = createApiClient(this.appConfig.apiUrl);
    const screenshotDir = resolve(this.agentConfig.reportOutput, 'screenshots');

    const ctx: ScenarioContext = {
      page,
      api,
      app: this.appConfig,
      config: this.agentConfig,
      data: {},
      issues,
      log: (message: string) => {
        this.onStepLog(scenario.id, message);
      },
      reportIssue: (issue) => {
        issues.push({ ...issue, page: page.url() });
      },
      takeScreenshot: async (name: string): Promise<string | undefined> => {
        try {
          const safeName = name.replace(/[^a-zA-Z0-9-_]/g, '-');
          const path = `${screenshotDir}/${scenario.id}-${safeName}.png`;
          await page.screenshot({ path, fullPage: true });
          return path;
        } catch {
          return undefined;
        }
      },
    };

    for (const step of scenario.steps) {
      const stepStart = Date.now();
      let retries = 0;
      let stepPassed = false;

      while (retries <= this.agentConfig.retryCount && !stepPassed) {
        try {
          ctx.log(`  -> ${step.name}${retries > 0 ? ` (retry ${retries})` : ''}`);

          await step.action(ctx);

          steps.push({
            name: step.name,
            status: 'passed',
            duration: Date.now() - stepStart,
          });
          stepPassed = true;
        } catch (error: any) {
          retries++;
          if (retries > this.agentConfig.retryCount) {
            const screenshotPath = await ctx.takeScreenshot(`${step.name}-FAILED`);

            steps.push({
              name: step.name,
              status: 'failed',
              duration: Date.now() - stepStart,
              error: error.message,
              screenshot: screenshotPath,
            });

            // Auto-report bug for failed step
            issues.push({
              type: 'bug',
              severity: 'major',
              title: `Step failed: ${step.name}`,
              description: error.message,
              page: page.url(),
              screenshot: screenshotPath,
              suggestion: `Investigate the failure in "${step.name}". Error: ${error.message}`,
            });

            scenarioStatus = 'failed';

            // Skip remaining steps
            for (
              let i = scenario.steps.indexOf(step) + 1;
              i < scenario.steps.length;
              i++
            ) {
              steps.push({
                name: scenario.steps[i].name,
                status: 'skipped',
                duration: 0,
              });
            }
            break;
          }
        }
      }

      if (scenarioStatus === 'failed') break;
    }

    // Report any console errors captured during the scenario
    if (consoleErrors.length > 0) {
      const screenshot = await ctx.takeScreenshot('console-errors');
      issues.push({
        type: 'console_error',
        severity: 'minor',
        title: `${consoleErrors.length} console error(s) during ${scenario.name}`,
        description: consoleErrors.slice(0, 10).join('\n'),
        page: page.url(),
        screenshot,
        suggestion: 'Review and fix console errors to improve stability.',
      });
    }

    await context.close();

    return {
      id: scenario.id,
      name: scenario.name,
      app: scenario.app,
      status: scenarioStatus,
      steps,
      issues,
      duration: Date.now() - startTime,
      startedAt,
      finishedAt: new Date().toISOString(),
    };
  }

  /**
   * Crawl all discoverable screens/pages in the application,
   * capture screenshots, and detect issues on each page.
   */
  private async crawlAllScreens(): Promise<void> {
    this.onStepLog('crawler', 'Starting screen discovery and audit...');

    const context = await this.browser!.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
    });
    const page = await context.newPage();
    page.setDefaultTimeout(this.agentConfig.timeoutMs);
    const screenshotDir = resolve(this.agentConfig.reportOutput, 'screenshots');

    // Login first
    try {
      await page.goto(`${this.appConfig.baseUrl}/login`);
      await page.fill('input[type="email"]', this.appConfig.credentials.email);
      await page.fill('input[type="password"]', this.appConfig.credentials.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(/dashboard|projects|home/, { timeout: 15000 });
    } catch {
      this.onStepLog('crawler', 'Could not login for crawling, proceeding with public pages');
    }

    // Discover all internal links
    const visited = new Set<string>();
    const toVisit: string[] = [this.appConfig.baseUrl];

    // Also add common routes for ProjeXtPal
    const commonRoutes = [
      '/', '/dashboard', '/projects', '/programs', '/kanban', '/scrum',
      '/settings', '/profile', '/academy', '/chat', '/team',
      '/admin', '/governance', '/surveys', '/notifications',
    ];
    for (const route of commonRoutes) {
      toVisit.push(`${this.appConfig.baseUrl}${route}`);
    }

    const maxPages = 30; // Limit to prevent infinite crawling

    while (toVisit.length > 0 && visited.size < maxPages) {
      const url = toVisit.shift()!;
      const normalizedUrl = url.split('?')[0].split('#')[0]; // Strip query/hash

      if (visited.has(normalizedUrl)) continue;
      if (!normalizedUrl.startsWith(this.appConfig.baseUrl)) continue;

      visited.add(normalizedUrl);
      this.onStepLog('crawler', `  Auditing: ${normalizedUrl}`);

      const audit = await this.auditPage(page, normalizedUrl, screenshotDir);
      this.pageAudits.push(audit);
      this.allIssues.push(...audit.issues);

      // Discover new links on the page
      try {
        const links: string[] = await page.evaluate(
          `Array.from(document.querySelectorAll('a[href]')).map(a => a.href).filter(h => h.startsWith('${this.appConfig.baseUrl}'))`
        );

        for (const link of links) {
          const normalizedLink = link.split('?')[0].split('#')[0];
          if (!visited.has(normalizedLink)) {
            toVisit.push(link);
          }
        }
      } catch {
        // Page might have navigated away
      }
    }

    await context.close();
    this.onStepLog('crawler', `Screen audit complete. ${visited.size} pages audited.`);
  }

  private async auditPage(page: any, url: string, screenshotDir: string): Promise<PageAudit> {
    const consoleErrors: string[] = [];
    const issues: Issue[] = [];

    const errorHandler = (msg: any) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    };
    page.on('console', errorHandler);

    const startTime = Date.now();
    let pageTitle = '';
    let status: 'ok' | 'error' | 'warning' = 'ok';

    try {
      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      const loadTime = Date.now() - startTime;
      pageTitle = await page.title();

      // Check HTTP status
      if (!response || response.status() >= 400) {
        status = 'error';
        issues.push({
          type: 'bug',
          severity: 'critical',
          title: `Page returns ${response?.status() || 'no response'}`,
          description: `${url} returned HTTP ${response?.status() || 'no response'}`,
          page: url,
          suggestion: 'Fix the route or page component that handles this URL.',
        });
      }

      // Slow page load
      if (loadTime > 5000) {
        status = 'warning';
        issues.push({
          type: 'performance',
          severity: 'minor',
          title: `Slow page load: ${(loadTime / 1000).toFixed(1)}s`,
          description: `${url} took ${loadTime}ms to load`,
          page: url,
          suggestion: 'Optimize page loading: lazy load components, reduce API calls, or add loading states.',
        });
      }

      // Check for error UI states
      const errorElements = await page.locator(
        'text=/error|something went wrong|404|not found|500|internal server error/i'
      ).count();
      if (errorElements > 0) {
        const errorText = await page.locator(
          'text=/error|something went wrong|404|not found|500|internal server error/i'
        ).first().textContent().catch(() => 'Unknown error');
        issues.push({
          type: 'bug',
          severity: 'major',
          title: `Error displayed on page`,
          description: `Error content found: "${errorText?.substring(0, 200)}"`,
          page: url,
          suggestion: 'Check the component for unhandled errors or missing data.',
        });
      }

      // Check for empty/broken pages
      const bodyText = await page.textContent('body').catch(() => '');
      if (bodyText && bodyText.trim().length < 20) {
        issues.push({
          type: 'bug',
          severity: 'major',
          title: 'Page appears empty or broken',
          description: `Page at ${url} has minimal content (${bodyText.trim().length} chars)`,
          page: url,
          suggestion: 'Check if the page component renders correctly. May be a routing or data loading issue.',
        });
      }

      // Accessibility checks
      const missingElements: string[] = [];
      const h1Count = await page.locator('h1').count();
      if (h1Count === 0) missingElements.push('h1 heading');

      const imgNoAlt = await page.locator('img:not([alt])').count();
      if (imgNoAlt > 0) {
        missingElements.push(`${imgNoAlt} images without alt text`);
        issues.push({
          type: 'a11y',
          severity: 'minor',
          title: `${imgNoAlt} images missing alt text`,
          description: `Found ${imgNoAlt} <img> elements without alt attribute on ${url}`,
          page: url,
          suggestion: 'Add descriptive alt attributes to all images for accessibility.',
        });
      }

      const btnNoLabel = await page.locator('button:not([aria-label]):not(:has-text(*))').count();
      if (btnNoLabel > 0) {
        missingElements.push(`${btnNoLabel} buttons without labels`);
        issues.push({
          type: 'a11y',
          severity: 'minor',
          title: `${btnNoLabel} buttons missing labels`,
          description: `Found ${btnNoLabel} buttons without text or aria-label on ${url}`,
          page: url,
          suggestion: 'Add aria-label or visible text to all interactive buttons.',
        });
      }

      // Check for broken images
      const brokenImgs: string[] = await page.evaluate(
        `Array.from(document.querySelectorAll('img')).filter(i => i.src && i.naturalWidth === 0 && i.complete).map(i => i.src)`
      );
      if (brokenImgs.length > 0) {
        issues.push({
          type: 'ui_issue',
          severity: 'minor',
          title: `${brokenImgs.length} broken images`,
          description: `Broken image sources: ${brokenImgs.slice(0, 3).join(', ')}`,
          page: url,
          suggestion: 'Fix image paths or add fallback images.',
        });
      }

      // Take screenshot
      const safeName = url.replace(this.appConfig.baseUrl, '').replace(/[^a-zA-Z0-9]/g, '-') || 'home';
      const screenshotPath = `${screenshotDir}/page-${safeName}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});

      // Console errors
      if (consoleErrors.length > 0) {
        issues.push({
          type: 'console_error',
          severity: 'minor',
          title: `${consoleErrors.length} console errors`,
          description: consoleErrors.slice(0, 5).join('\n'),
          page: url,
          suggestion: 'Fix JavaScript console errors for better stability.',
        });
      }

      page.off('console', errorHandler);

      return {
        url,
        title: pageTitle,
        status,
        loadTime: Date.now() - startTime,
        screenshot: screenshotPath,
        consoleErrors,
        missingElements,
        issues,
      };
    } catch (error: any) {
      page.off('console', errorHandler);

      const screenshotPath = `${screenshotDir}/page-error-${Date.now()}.png`;
      await page.screenshot({ path: screenshotPath }).catch(() => {});

      issues.push({
        type: 'bug',
        severity: 'critical',
        title: `Page failed to load: ${error.message.substring(0, 80)}`,
        description: error.message,
        page: url,
        screenshot: screenshotPath,
        suggestion: 'Check if the page route exists and the component loads without errors.',
      });

      return {
        url,
        title: pageTitle,
        status: 'error',
        loadTime: Date.now() - startTime,
        screenshot: screenshotPath,
        consoleErrors,
        missingElements: [],
        issues,
      };
    }
  }
}

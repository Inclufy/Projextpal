#!/usr/bin/env node

import { Command } from 'commander';
import { TestRunner, getAppConfig, getAgentConfig, printReport, saveReport, getRegisteredApps } from './core/index.js';
import { projectpalScenarios } from './scenarios/projectpal/index.js';
import { financeScenarios } from './scenarios/finance/index.js';
import { marketingScenarios } from './scenarios/marketing/index.js';
import { genericScenarios } from './scenarios/generic/index.js';
import type { Scenario } from './core/types.js';

const SCENARIO_REGISTRY: Record<string, Scenario[]> = {
  projectpal: projectpalScenarios,
  finance: financeScenarios,
  marketing: marketingScenarios,
  generic: genericScenarios,
};

const program = new Command();

program
  .name('uat-agent')
  .description('Inclufy UAT Test Agent - Automated UAT testing for ProjeXtPal and other applications')
  .version('1.0.0');

program
  .command('list')
  .description('List all available test scenarios')
  .option('-a, --app <app>', 'Filter by application name')
  .option('-t, --tag <tag>', 'Filter by tag')
  .action((options) => {
    console.log('\n  Available UAT Scenarios');
    console.log('  ' + '='.repeat(50));

    for (const [appKey, scenarios] of Object.entries(SCENARIO_REGISTRY)) {
      if (options.app && appKey !== options.app.toLowerCase()) continue;

      console.log(`\n  [${appKey.toUpperCase()}]`);
      for (const scenario of scenarios) {
        if (options.tag && !scenario.tags.includes(options.tag)) continue;
        console.log(`    ${scenario.id} - ${scenario.name}`);
        console.log(`      Tags: ${scenario.tags.join(', ')}`);
        console.log(`      Steps: ${scenario.steps.length}`);
      }
    }

    console.log('\n  Registered apps:', getRegisteredApps().join(', '));
    console.log();
  });

program
  .command('run')
  .description('Run UAT test scenarios')
  .option('-a, --app <app>', 'Application to test (projectpal, generic)', 'projectpal')
  .option('-s, --scenario <ids...>', 'Specific scenario IDs to run')
  .option('-t, --tag <tags...>', 'Run scenarios with specific tags')
  .option('--all', 'Run all scenarios for the app')
  .option('--headed', 'Run browser in headed mode (visible)')
  .option('--crawl', 'Crawl all screens and audit each page for bugs')
  .option('--no-report', 'Skip saving report files')
  .action(async (options) => {
    const appName = options.app.toLowerCase();
    const appConfig = getAppConfig(appName);
    const agentConfig = getAgentConfig();

    if (options.headed) {
      agentConfig.headless = false;
    }
    if (options.crawl) {
      agentConfig.crawlScreens = true;
    }

    console.log('\n  Inclufy UAT Agent v1.0.0');
    console.log('  ' + '-'.repeat(40));
    console.log(`  App:         ${appConfig.name}`);
    console.log(`  Frontend:    ${appConfig.baseUrl}`);
    console.log(`  API:         ${appConfig.apiUrl}`);
    console.log(`  Headless:    ${agentConfig.headless}`);
    console.log('  ' + '-'.repeat(40));

    // Collect scenarios
    let scenarios: Scenario[] = [];

    if (options.all) {
      // Run all scenarios for the app
      scenarios = SCENARIO_REGISTRY[appName] || [];
      if (appName !== 'generic') {
        // Also add generic scenarios
        scenarios = [...scenarios, ...genericScenarios];
      }
    } else if (options.scenario) {
      // Run specific scenarios by ID
      const allScenarios = Object.values(SCENARIO_REGISTRY).flat();
      scenarios = allScenarios.filter((s) => options.scenario.includes(s.id));
    } else if (options.tag) {
      // Run by tag
      const allScenarios = Object.values(SCENARIO_REGISTRY).flat();
      scenarios = allScenarios.filter((s) =>
        s.tags.some((t: string) => options.tag.includes(t))
      );
    } else {
      // Default: run smoke tests for the app
      scenarios = (SCENARIO_REGISTRY[appName] || []).filter((s) =>
        s.tags.includes('smoke') || s.tags.includes('critical')
      );
      if (scenarios.length === 0) {
        scenarios = SCENARIO_REGISTRY[appName] || [];
      }
    }

    if (scenarios.length === 0) {
      console.log('\n  No scenarios found matching your criteria.');
      console.log('  Use "uat-agent list" to see available scenarios.\n');
      process.exit(1);
    }

    console.log(`\n  Running ${scenarios.length} scenario(s)...\n`);

    const runner = new TestRunner(appConfig, agentConfig, (id, msg) => {
      console.log(`  [${id}] ${msg}`);
    });

    runner.addScenarios(scenarios);

    try {
      const report = await runner.run();

      printReport(report);

      if (options.report !== false) {
        saveReport(report, agentConfig.reportOutput);
      }

      // Exit with error code if any scenarios failed
      if (report.summary.failed > 0) {
        process.exit(1);
      }
    } catch (error: any) {
      console.error(`\n  Fatal error: ${error.message}\n`);
      process.exit(2);
    }
  });

program
  .command('api-test')
  .description('Run API-only tests without a browser (HTTP health checks, route checks, endpoint tests)')
  .option('-a, --app <app>', 'Application to test', 'projectpal')
  .option('--base-url <url>', 'Override frontend base URL')
  .option('--api-url <url>', 'Override API base URL')
  .action(async (options) => {
    const appName = options.app.toLowerCase();
    const appConfig = getAppConfig(appName);
    if (options.baseUrl) appConfig.baseUrl = options.baseUrl;
    if (options.apiUrl) appConfig.apiUrl = options.apiUrl;

    const { createApiClient } = await import('./core/api-client.js');
    const { mkdirSync, writeFileSync, existsSync } = await import('fs');

    console.log('\n  Inclufy UAT Agent v1.0.0 - API Test Mode (no browser)');
    console.log('  ' + '-'.repeat(55));
    console.log(`  App:      ${appConfig.name}`);
    console.log(`  Base URL: ${appConfig.baseUrl}`);
    console.log(`  API URL:  ${appConfig.apiUrl}`);
    console.log('  ' + '-'.repeat(55));

    const api = createApiClient(appConfig.apiUrl);
    const results: { endpoint: string; method: string; status: number; ok: boolean; time: number; error?: string }[] = [];

    async function testEndpoint(method: string, path: string, body?: any): Promise<void> {
      const start = Date.now();
      try {
        const res = method === 'GET' ? await api.get(path) : await api.post(path, body);
        const time = Date.now() - start;
        const icon = res.ok ? '\x1b[32m PASS \x1b[0m' : (res.status < 500 ? '\x1b[33m WARN \x1b[0m' : '\x1b[31m FAIL \x1b[0m');
        console.log(`  ${icon} ${method} ${path} -> ${res.status} (${time}ms)`);
        results.push({ endpoint: path, method, status: res.status, ok: res.ok, time });
      } catch (err: any) {
        const time = Date.now() - start;
        console.log(`  \x1b[31m ERR  \x1b[0m ${method} ${path} -> ${err.message.substring(0, 80)} (${time}ms)`);
        results.push({ endpoint: path, method, status: 0, ok: false, time, error: err.message });
      }
    }

    async function testFrontendRoute(route: string): Promise<void> {
      const start = Date.now();
      try {
        const res = await fetch(`${appConfig.baseUrl}${route}`);
        const time = Date.now() - start;
        const icon = res.ok ? '\x1b[32m PASS \x1b[0m' : '\x1b[31m FAIL \x1b[0m';
        console.log(`  ${icon} GET ${route} -> ${res.status} (${time}ms)`);
        results.push({ endpoint: route, method: 'GET', status: res.status, ok: res.ok, time });
      } catch (err: any) {
        const time = Date.now() - start;
        console.log(`  \x1b[31m ERR  \x1b[0m GET ${route} -> ${err.message.substring(0, 80)} (${time}ms)`);
        results.push({ endpoint: route, method: 'GET', status: 0, ok: false, time, error: err.message });
      }
    }

    // 1. Frontend health
    console.log('\n  --- Frontend Health ---');
    await testFrontendRoute('/');

    // 2. Frontend routes
    console.log('\n  --- Frontend Routes ---');
    const routes = ['/login', '/dashboard', '/projects', '/kanban', '/scrum', '/academy',
      '/chat', '/team', '/governance', '/profile', '/settings', '/pricing', '/programs',
      '/admin', '/surveys', '/notifications'];
    for (const route of routes) await testFrontendRoute(route);

    // 3. Public API endpoints
    console.log('\n  --- Public API Endpoints ---');
    await testEndpoint('GET', '/health/');
    await testEndpoint('GET', '/api/schema/');

    // 4. Auth
    console.log('\n  --- Authentication ---');
    const loginRes = await api.post('/api/v1/auth/login/', {
      email: appConfig.credentials.email,
      password: appConfig.credentials.password,
    });
    if (loginRes.ok) {
      const token = loginRes.data?.access || loginRes.data?.token || loginRes.data?.key;
      if (token) {
        api.setToken(token);
        console.log(`  \x1b[32m PASS \x1b[0m POST /api/v1/auth/login/ -> ${loginRes.status} (token received)`);
      } else {
        console.log(`  \x1b[33m WARN \x1b[0m POST /api/v1/auth/login/ -> ${loginRes.status} (no token in response)`);
      }
    } else {
      console.log(`  \x1b[31m FAIL \x1b[0m POST /api/v1/auth/login/ -> ${loginRes.status}`);
    }
    results.push({ endpoint: '/api/v1/auth/login/', method: 'POST', status: loginRes.status, ok: loginRes.ok, time: 0 });

    // 5. Protected endpoints
    console.log('\n  --- Protected API Endpoints ---');
    await testEndpoint('GET', '/api/v1/projects/');
    await testEndpoint('GET', '/api/v1/programs/');
    await testEndpoint('GET', '/api/v1/projects/tasks/');
    await testEndpoint('GET', '/api/v1/projects/milestones/');
    await testEndpoint('GET', '/api/v1/bot/chats/');
    await testEndpoint('GET', '/api/v1/academy/courses/');
    await testEndpoint('GET', '/api/v1/governance/');
    await testEndpoint('GET', '/api/v1/governance/portfolios/');
    await testEndpoint('GET', '/api/v1/governance/stakeholders/');
    await testEndpoint('GET', '/api/v1/subscriptions/');

    // Summary
    const passed = results.filter(r => r.ok).length;
    const failed = results.filter(r => !r.ok).length;
    const avgTime = results.length > 0 ? Math.round(results.reduce((a, r) => a + r.time, 0) / results.length) : 0;

    console.log('\n  ' + '='.repeat(55));
    console.log(`  Results: \x1b[32m${passed} passed\x1b[0m, \x1b[31m${failed} failed\x1b[0m, ${results.length} total`);
    console.log(`  Avg response time: ${avgTime}ms`);
    console.log('  ' + '='.repeat(55));

    // Save report
    const reportDir = process.env.REPORT_OUTPUT || './reports';
    if (!existsSync(reportDir)) mkdirSync(reportDir, { recursive: true });
    const reportPath = `${reportDir}/api-test-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    writeFileSync(reportPath, JSON.stringify({
      agent: 'inclufy-uat-agent',
      mode: 'api-test',
      app: appConfig.name,
      baseUrl: appConfig.baseUrl,
      apiUrl: appConfig.apiUrl,
      timestamp: new Date().toISOString(),
      results,
      summary: { passed, failed, total: results.length, avgTime },
    }, null, 2));
    console.log(`\n  Report saved: ${reportPath}\n`);

    if (failed > 0) process.exit(1);
  });

program
  .command('code-audit')
  .description('Scan local source code or a git repo for issues (no server/browser needed)')
  .argument('<path>', 'Local directory path or git repo URL (GitHub/GitLab)')
  .option('--json', 'Output report as JSON only')
  .action(async (sourcePath: string, options) => {
    const { runCodeAudit, cloneRepo } = await import('./core/code-auditor.js');
    const { mkdirSync, writeFileSync, existsSync } = await import('fs');
    const { resolve } = await import('path');

    console.log('\n  Inclufy UAT Agent v1.0.0 - Code Audit Mode');
    console.log('  ' + '='.repeat(55));

    // Determine if source is a git URL or local path
    let rootDir: string;
    let isCloned = false;
    if (sourcePath.startsWith('http://') || sourcePath.startsWith('https://') || sourcePath.startsWith('git@')) {
      rootDir = cloneRepo(sourcePath);
      isCloned = true;
    } else {
      rootDir = resolve(sourcePath);
      if (!existsSync(rootDir)) {
        console.error(`  Error: Path does not exist: ${rootDir}`);
        process.exit(1);
      }
    }

    console.log(`  Source: ${sourcePath}`);
    console.log(`  Path:   ${rootDir}`);
    console.log('  ' + '-'.repeat(55));

    const report = runCodeAudit(rootDir);

    // Print results
    if (!options.json) {
      console.log(`\n  Scan completed in ${report.duration}ms`);
      console.log(`  Files scanned:      ${report.stats.filesScanned}`);
      console.log(`  Components found:   ${report.stats.componentsFound}`);
      console.log(`  Routes found:       ${report.stats.routesFound}`);
      console.log(`  API calls found:    ${report.stats.apiEndpointsFound}`);
      console.log(`  Translation keys:   ${report.stats.translationKeysUsed}`);

      if (report.issues.length > 0) {
        console.log(`\n  --- Issues (${report.summary.total}) ---`);

        // Group by category
        const byCategory = new Map<string, typeof report.issues>();
        for (const issue of report.issues) {
          if (!byCategory.has(issue.category)) byCategory.set(issue.category, []);
          byCategory.get(issue.category)!.push(issue);
        }

        for (const [category, catIssues] of byCategory) {
          console.log(`\n  [${category.toUpperCase()}] (${catIssues.length})`);
          for (const issue of catIssues.slice(0, 15)) {
            const icon = issue.type === 'error' ? '\x1b[31mERR \x1b[0m' : issue.type === 'warning' ? '\x1b[33mWARN\x1b[0m' : '\x1b[36mINFO\x1b[0m';
            const loc = issue.line ? `${issue.file}:${issue.line}` : issue.file;
            console.log(`    ${icon} ${loc}`);
            console.log(`         ${issue.message}`);
            if (issue.suggestion) {
              console.log(`         -> ${issue.suggestion}`);
            }
          }
          if (catIssues.length > 15) {
            console.log(`    ... and ${catIssues.length - 15} more`);
          }
        }
      }

      console.log(`\n  ${'='.repeat(55)}`);
      console.log(`  \x1b[31m${report.summary.errors} errors\x1b[0m, \x1b[33m${report.summary.warnings} warnings\x1b[0m, \x1b[36m${report.summary.info} info\x1b[0m`);
      console.log(`  ${'='.repeat(55)}`);
    }

    // Save report
    const reportDir = process.env.REPORT_OUTPUT || './reports';
    if (!existsSync(reportDir)) mkdirSync(reportDir, { recursive: true });
    const reportPath = `${reportDir}/code-audit-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n  Report saved: ${reportPath}`);

    // Cleanup cloned repo
    if (isCloned) {
      try {
        const { rmSync } = await import('fs');
        rmSync(rootDir, { recursive: true, force: true });
        console.log(`  Cleaned up cloned repo`);
      } catch { /* ignore cleanup errors */ }
    }

    console.log();
    if (report.summary.errors > 0) process.exit(1);
  });

program
  .command('apps')
  .description('List registered applications')
  .action(() => {
    console.log('\n  Registered Applications:');
    for (const app of getRegisteredApps()) {
      const config = getAppConfig(app);
      console.log(`    - ${app}: ${config.name} (${config.baseUrl})`);
    }
    console.log();
  });

program.parse();

#!/usr/bin/env node

import { Command } from 'commander';
import { TestRunner, getAppConfig, getAgentConfig, printReport, saveReport, getRegisteredApps } from './core/index.js';
import { projectpalScenarios } from './scenarios/projectpal/index.js';
import { genericScenarios } from './scenarios/generic/index.js';
import type { Scenario } from './core/types.js';

const SCENARIO_REGISTRY: Record<string, Scenario[]> = {
  projectpal: projectpalScenarios,
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

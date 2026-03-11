import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';
import type { TestReport, Issue } from './types.js';

export function printReport(report: TestReport): void {
  const line = '-'.repeat(60);
  console.log(`\n${line}`);
  console.log(`  UAT Test Report: ${report.app}`);
  console.log(`  Environment: ${report.environment}`);
  console.log(`  Duration: ${formatDuration(report.duration)}`);
  console.log(line);

  console.log(
    `\n  Scenarios: ${report.summary.total}  |  ` +
      `Passed: ${report.summary.passed}  |  ` +
      `Failed: ${report.summary.failed}  |  ` +
      `Skipped: ${report.summary.skipped}`
  );
  console.log(
    `  Issues: ${report.summary.issuesFound}  |  ` +
      `Bugs: ${report.summary.bugCount}  |  ` +
      `Missing Features: ${report.summary.missingFeatureCount}`
  );

  console.log(`\n${line}`);
  console.log('  Scenarios:');
  console.log(line);

  for (const scenario of report.scenarios) {
    const icon =
      scenario.status === 'passed'
        ? '[PASS]'
        : scenario.status === 'failed'
          ? '[FAIL]'
          : '[SKIP]';
    console.log(
      `\n  ${icon} ${scenario.name} (${formatDuration(scenario.duration)})`
    );

    for (const step of scenario.steps) {
      const stepIcon =
        step.status === 'passed'
          ? '  +'
          : step.status === 'failed'
            ? '  x'
            : '  -';
      const extra = step.error ? ` -- ${step.error}` : '';
      console.log(
        `      ${stepIcon} ${step.name} (${formatDuration(step.duration)})${extra}`
      );
    }

    if (scenario.issues.length > 0) {
      console.log(`      Issues (${scenario.issues.length}):`);
      for (const issue of scenario.issues) {
        const sev = issue.severity.toUpperCase().padEnd(8);
        console.log(`        [${sev}] ${issue.type}: ${issue.title}`);
        if (issue.suggestion) {
          console.log(`                 Fix: ${issue.suggestion}`);
        }
      }
    }
  }

  // Page audits summary
  if (report.pageAudits.length > 0) {
    console.log(`\n${line}`);
    console.log(`  Page Audits: ${report.pageAudits.length} pages crawled`);
    console.log(line);
    for (const audit of report.pageAudits) {
      const icon = audit.status === 'ok' ? '[OK]' : audit.status === 'warning' ? '[!!]' : '[XX]';
      console.log(`  ${icon} ${audit.url} (${formatDuration(audit.loadTime)})`);
      if (audit.issues.length > 0) {
        console.log(`      ${audit.issues.length} issue(s) found`);
      }
    }
  }

  // All issues summary
  if (report.allIssues.length > 0) {
    console.log(`\n${line}`);
    console.log(`  All Issues (${report.allIssues.length}):`);
    console.log(line);
    const grouped = groupIssuesByType(report.allIssues);
    for (const [type, issues] of Object.entries(grouped)) {
      console.log(`\n  [${type.toUpperCase()}] (${issues.length})`);
      for (const issue of issues) {
        console.log(`    - [${issue.severity}] ${issue.title}`);
        if (issue.suggestion) {
          console.log(`      Fix: ${issue.suggestion}`);
        }
      }
    }
  }

  console.log(`\n${line}\n`);
}

export function saveReport(report: TestReport, outputDir: string): string {
  const dir = resolve(outputDir);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `uat-report-${report.app.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.json`;
  const filepath = resolve(dir, filename);

  writeFileSync(filepath, JSON.stringify(report, null, 2));

  const htmlPath = filepath.replace('.json', '.html');
  writeFileSync(htmlPath, generateHtmlReport(report));

  console.log(`  Report saved: ${filepath}`);
  console.log(`  HTML report:  ${htmlPath}`);
  return filepath;
}

function groupIssuesByType(issues: Issue[]): Record<string, Issue[]> {
  const grouped: Record<string, Issue[]> = {};
  for (const issue of issues) {
    if (!grouped[issue.type]) grouped[issue.type] = [];
    grouped[issue.type].push(issue);
  }
  return grouped;
}

function generateHtmlReport(report: TestReport): string {
  const passRate =
    report.summary.total > 0
      ? Math.round((report.summary.passed / report.summary.total) * 100)
      : 0;

  const scenarioRows = report.scenarios
    .map((s) => {
      const statusClass =
        s.status === 'passed' ? 'pass' : s.status === 'failed' ? 'fail' : 'skip';
      const stepsHtml = s.steps
        .map((step) => {
          const cls =
            step.status === 'passed' ? 'pass' : step.status === 'failed' ? 'fail' : 'skip';
          return `<li class="${cls}">${escapeHtml(step.name)} <span class="dur">(${formatDuration(step.duration)})</span>${step.error ? `<br><small class="err">${escapeHtml(step.error)}</small>` : ''}${step.screenshot ? `<br><a href="${escapeHtml(step.screenshot)}" class="screenshot-link">View Screenshot</a>` : ''}</li>`;
        })
        .join('');

      const issuesHtml = s.issues.length > 0
        ? `<div class="issues"><h4>Issues (${s.issues.length})</h4><ul>${s.issues.map((i) => `<li class="issue ${i.severity}"><strong>[${i.severity.toUpperCase()}]</strong> ${escapeHtml(i.title)}<br><small>${escapeHtml(i.description.substring(0, 200))}</small>${i.suggestion ? `<br><em class="suggestion">Fix: ${escapeHtml(i.suggestion)}</em>` : ''}${i.screenshot ? `<br><a href="${escapeHtml(i.screenshot)}" class="screenshot-link">Bug Screenshot</a>` : ''}</li>`).join('')}</ul></div>`
        : '';

      return `
      <div class="scenario ${statusClass}">
        <h3>${escapeHtml(s.name)} <span class="badge ${statusClass}">${s.status.toUpperCase()}</span></h3>
        <p>Duration: ${formatDuration(s.duration)}</p>
        <ol class="steps">${stepsHtml}</ol>
        ${issuesHtml}
      </div>`;
    })
    .join('');

  const pageAuditRows = report.pageAudits.length > 0
    ? `<h2>Page Audits (${report.pageAudits.length} pages)</h2>` +
      report.pageAudits.map((a) => {
        const cls = a.status === 'ok' ? 'pass' : a.status === 'warning' ? 'warn' : 'fail';
        return `<div class="audit ${cls}">
          <h4>${escapeHtml(a.url)} <span class="badge ${cls}">${a.status.toUpperCase()}</span></h4>
          <p>Title: ${escapeHtml(a.title)} | Load: ${formatDuration(a.loadTime)}</p>
          ${a.consoleErrors.length > 0 ? `<p class="err">Console errors: ${a.consoleErrors.length}</p>` : ''}
          ${a.issues.length > 0 ? `<ul>${a.issues.map((i) => `<li class="issue ${i.severity}"><strong>[${i.severity}]</strong> ${escapeHtml(i.title)}${i.suggestion ? `<br><em class="suggestion">Fix: ${escapeHtml(i.suggestion)}</em>` : ''}</li>`).join('')}</ul>` : ''}
        </div>`;
      }).join('')
    : '';

  const allIssuesHtml = report.allIssues.length > 0
    ? `<h2>All Issues (${report.allIssues.length})</h2>
      <table class="issues-table">
        <tr><th>Severity</th><th>Type</th><th>Title</th><th>Page</th><th>Fix Suggestion</th></tr>
        ${report.allIssues.map((i) => `<tr class="${i.severity}">
          <td><span class="badge ${i.severity}">${i.severity.toUpperCase()}</span></td>
          <td>${i.type}</td>
          <td>${escapeHtml(i.title)}</td>
          <td><small>${escapeHtml(i.page)}</small></td>
          <td><small>${i.suggestion ? escapeHtml(i.suggestion) : '-'}</small></td>
        </tr>`).join('')}
      </table>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>UAT Report - ${escapeHtml(report.app)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 1100px; margin: 0 auto; padding: 20px; background: #1a1a2e; color: #e0e0e0; }
    h1 { color: #8be9fd; }
    h2 { color: #bd93f9; border-bottom: 1px solid #44475a; padding-bottom: 8px; }
    .summary { display: flex; gap: 16px; margin: 20px 0; flex-wrap: wrap; }
    .stat { background: #282a36; padding: 14px 20px; border-radius: 8px; text-align: center; flex: 1; min-width: 100px; }
    .stat .num { font-size: 1.8em; font-weight: bold; }
    .stat.total .num { color: #8be9fd; }
    .stat.passed .num { color: #50fa7b; }
    .stat.failed .num { color: #ff5555; }
    .stat.skipped .num { color: #f1fa8c; }
    .stat.bugs .num { color: #ff5555; }
    .stat.missing .num { color: #ffb86c; }
    .scenario { background: #282a36; border-radius: 8px; padding: 16px; margin: 12px 0; border-left: 4px solid #44475a; }
    .scenario.pass { border-left-color: #50fa7b; }
    .scenario.fail { border-left-color: #ff5555; }
    .scenario.skip { border-left-color: #f1fa8c; }
    .audit { background: #282a36; border-radius: 8px; padding: 12px; margin: 8px 0; border-left: 3px solid #44475a; }
    .audit.pass { border-left-color: #50fa7b; }
    .audit.warn { border-left-color: #f1fa8c; }
    .audit.fail { border-left-color: #ff5555; }
    .badge { padding: 2px 8px; border-radius: 4px; font-size: 0.75em; }
    .badge.pass { background: #50fa7b; color: #1a1a2e; }
    .badge.fail, .badge.critical { background: #ff5555; color: #fff; }
    .badge.skip, .badge.warn { background: #f1fa8c; color: #1a1a2e; }
    .badge.major { background: #ffb86c; color: #1a1a2e; }
    .badge.minor { background: #6272a4; color: #fff; }
    .badge.info { background: #44475a; color: #e0e0e0; }
    .steps { list-style: decimal; padding-left: 24px; }
    .steps li { padding: 4px 0; }
    .steps li.pass { color: #50fa7b; }
    .steps li.fail { color: #ff5555; }
    .steps li.skip { color: #6272a4; }
    .issues { margin-top: 12px; padding: 10px; background: #1e1e30; border-radius: 6px; }
    .issues h4 { color: #ffb86c; margin: 0 0 8px 0; }
    .issue { padding: 4px 0; }
    .issue.critical { color: #ff5555; }
    .issue.major { color: #ffb86c; }
    .issue.minor { color: #f1fa8c; }
    .suggestion { color: #50fa7b; }
    .dur { color: #6272a4; }
    .err { color: #ff79c6; }
    .meta { color: #6272a4; font-size: 0.9em; }
    .screenshot-link { color: #8be9fd; text-decoration: underline; font-size: 0.85em; }
    .issues-table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 0.9em; }
    .issues-table th { background: #282a36; padding: 8px; text-align: left; border-bottom: 2px solid #44475a; }
    .issues-table td { padding: 8px; border-bottom: 1px solid #44475a; }
    .issues-table tr.critical { background: rgba(255,85,85,0.1); }
    .issues-table tr.major { background: rgba(255,184,108,0.1); }
  </style>
</head>
<body>
  <h1>UAT Test Report</h1>
  <p class="meta">App: <strong>${escapeHtml(report.app)}</strong> | Environment: ${escapeHtml(report.environment)} | ${report.startedAt}</p>

  <div class="summary">
    <div class="stat total"><div class="num">${report.summary.total}</div><div>Scenarios</div></div>
    <div class="stat passed"><div class="num">${report.summary.passed}</div><div>Passed</div></div>
    <div class="stat failed"><div class="num">${report.summary.failed}</div><div>Failed</div></div>
    <div class="stat bugs"><div class="num">${report.summary.bugCount}</div><div>Bugs</div></div>
    <div class="stat missing"><div class="num">${report.summary.missingFeatureCount}</div><div>Missing</div></div>
  </div>

  <h2>Pass Rate: ${passRate}%</h2>
  <div style="background:#44475a;border-radius:8px;height:12px;overflow:hidden;">
    <div style="background:${passRate >= 80 ? '#50fa7b' : passRate >= 50 ? '#f1fa8c' : '#ff5555'};height:100%;width:${passRate}%;transition:width 0.5s;"></div>
  </div>

  <h2>Scenarios</h2>
  ${scenarioRows}

  ${pageAuditRows}

  ${allIssuesHtml}

  <p class="meta" style="margin-top:30px;">Generated by inclufy-uat-agent v${report.version} | Duration: ${formatDuration(report.duration)}</p>
</body>
</html>`;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

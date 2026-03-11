/**
 * Static Code Auditor - Scans source code files for common issues
 * Works on local directories or cloned git repos (GitHub/GitLab)
 * No running server or browser needed.
 */

import { readdirSync, readFileSync, statSync, existsSync } from 'fs';
import { join, extname, relative, basename } from 'path';
import { execSync } from 'child_process';

export interface CodeIssue {
  type: 'error' | 'warning' | 'info';
  category: string;
  file: string;
  line?: number;
  message: string;
  suggestion?: string;
}

export interface AuditReport {
  agent: string;
  mode: string;
  source: string;
  timestamp: string;
  duration: number;
  stats: {
    filesScanned: number;
    componentsFound: number;
    routesFound: number;
    apiEndpointsFound: number;
    translationKeysUsed: number;
  };
  issues: CodeIssue[];
  summary: {
    errors: number;
    warnings: number;
    info: number;
    total: number;
  };
}

/**
 * Clone a git repository to a temp directory
 */
export function cloneRepo(repoUrl: string): string {
  const tmpDir = `/tmp/uat-audit-${Date.now()}`;
  console.log(`  Cloning ${repoUrl}...`);
  try {
    execSync(`git clone --depth 1 ${repoUrl} ${tmpDir}`, { stdio: 'pipe', timeout: 60000 });
    console.log(`  Cloned to ${tmpDir}`);
    return tmpDir;
  } catch (err: any) {
    throw new Error(`Failed to clone repo: ${err.message}`);
  }
}

/**
 * Recursively find all files matching extensions
 */
function findFiles(dir: string, extensions: string[], ignore: string[] = []): string[] {
  const files: string[] = [];
  const defaultIgnore = ['node_modules', '.git', 'dist', 'build', '.next', '__pycache__', 'venv', '.venv', 'migrations'];
  const allIgnore = [...defaultIgnore, ...ignore];

  function walk(currentDir: string) {
    try {
      const entries = readdirSync(currentDir);
      for (const entry of entries) {
        if (allIgnore.includes(entry)) continue;
        const fullPath = join(currentDir, entry);
        try {
          const stat = statSync(fullPath);
          if (stat.isDirectory()) {
            walk(fullPath);
          } else if (extensions.includes(extname(entry).toLowerCase())) {
            files.push(fullPath);
          }
        } catch { /* skip unreadable */ }
      }
    } catch { /* skip unreadable dirs */ }
  }

  walk(dir);
  return files;
}

/**
 * Detect the project type (React, Django, Next.js, etc.)
 */
function detectProjectType(rootDir: string): { frontend?: string; backend?: string; frontendDir?: string; backendDir?: string } {
  const result: { frontend?: string; backend?: string; frontendDir?: string; backendDir?: string } = {};

  // Check for frontend
  const frontendDirs = ['frontend', 'client', 'web', 'app', '.'];
  for (const dir of frontendDirs) {
    const pkgPath = join(rootDir, dir, 'package.json');
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps['react']) result.frontend = 'react';
      else if (deps['vue']) result.frontend = 'vue';
      else if (deps['@angular/core']) result.frontend = 'angular';
      else if (deps['svelte']) result.frontend = 'svelte';
      else if (deps['next']) result.frontend = 'nextjs';
      else result.frontend = 'node';
      result.frontendDir = join(rootDir, dir);
      break;
    }
  }

  // Check for backend
  const backendDirs = ['backend', 'server', 'api', '.'];
  for (const dir of backendDirs) {
    const managePyPath = join(rootDir, dir, 'manage.py');
    const requirementsPath = join(rootDir, dir, 'requirements.txt');
    const goModPath = join(rootDir, dir, 'go.mod');
    const gemfilePath = join(rootDir, dir, 'Gemfile');

    if (existsSync(managePyPath)) {
      result.backend = 'django';
      result.backendDir = join(rootDir, dir);
      break;
    } else if (existsSync(requirementsPath)) {
      const reqs = readFileSync(requirementsPath, 'utf-8');
      if (reqs.includes('flask')) result.backend = 'flask';
      else if (reqs.includes('fastapi')) result.backend = 'fastapi';
      else result.backend = 'python';
      result.backendDir = join(rootDir, dir);
      break;
    } else if (existsSync(goModPath)) {
      result.backend = 'go';
      result.backendDir = join(rootDir, dir);
      break;
    } else if (existsSync(gemfilePath)) {
      result.backend = 'rails';
      result.backendDir = join(rootDir, dir);
      break;
    }
  }

  return result;
}

/**
 * Run the full code audit
 */
export function runCodeAudit(rootDir: string): AuditReport {
  const startTime = Date.now();
  const issues: CodeIssue[] = [];
  const stats = {
    filesScanned: 0,
    componentsFound: 0,
    routesFound: 0,
    apiEndpointsFound: 0,
    translationKeysUsed: 0,
  };

  const project = detectProjectType(rootDir);
  console.log(`  Project type: Frontend=${project.frontend || 'none'}, Backend=${project.backend || 'none'}`);

  // ── Frontend Audit ──
  if (project.frontendDir) {
    const srcDir = existsSync(join(project.frontendDir, 'src'))
      ? join(project.frontendDir, 'src')
      : project.frontendDir;

    // Scan React/Vue/TS/JS files
    const frontendFiles = findFiles(srcDir, ['.tsx', '.ts', '.jsx', '.js', '.vue']);
    stats.filesScanned += frontendFiles.length;
    console.log(`  Scanning ${frontendFiles.length} frontend files...`);

    const allExports = new Map<string, string>(); // component name -> file
    const allImports = new Map<string, Set<string>>(); // file -> imported modules
    const routeDefinitions: string[] = [];
    const apiCallPatterns: string[] = [];

    for (const file of frontendFiles) {
      const relPath = relative(rootDir, file);
      let content: string;
      try {
        content = readFileSync(file, 'utf-8');
      } catch { continue; }

      const lines = content.split('\n');

      // --- Check 1: Console.log left in code ---
      lines.forEach((line, idx) => {
        if (/console\.(log|debug|info)\(/.test(line) && !/\/\//.test(line.split('console')[0])) {
          issues.push({
            type: 'info',
            category: 'code-quality',
            file: relPath,
            line: idx + 1,
            message: `console.${line.match(/console\.(log|debug|info)/)?.[1] || 'log'}() left in code`,
            suggestion: 'Remove console statements before production.',
          });
        }
      });

      // --- Check 2: Components (React) ---
      const componentMatch = content.match(/(?:export\s+(?:default\s+)?)?(?:const|function)\s+([A-Z]\w+)\s*[=:(]/g);
      if (componentMatch) {
        for (const m of componentMatch) {
          const name = m.match(/(?:const|function)\s+([A-Z]\w+)/)?.[1];
          if (name) {
            allExports.set(name, relPath);
            stats.componentsFound++;
          }
        }
      }

      // --- Check 3: Imports ---
      const importSet = new Set<string>();
      const importMatches = content.matchAll(/import\s+(?:{[^}]*}|\w+)?\s*(?:,\s*{[^}]*})?\s*from\s+['"]([^'"]+)['"]/g);
      for (const m of importMatches) {
        importSet.add(m[1]);
      }
      allImports.set(relPath, importSet);

      // --- Check 4: Route definitions ---
      const routeMatches = content.matchAll(/(?:path|to|href)\s*[:=]\s*['"`]([\/][^'"`\s]*?)['"`]/g);
      for (const m of routeMatches) {
        routeDefinitions.push(m[1]);
        stats.routesFound++;
      }

      // --- Check 5: API calls ---
      const apiMatches = content.matchAll(/(?:fetch|axios|api)\s*[.(]\s*['"`]([^'"`]+)['"`]/g);
      for (const m of apiMatches) {
        apiCallPatterns.push(m[1]);
        stats.apiEndpointsFound++;
      }

      // --- Check 6: Translation usage ---
      const translationMatches = content.matchAll(/(?:pt|t|i18n|translate)\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g);
      for (const _m of translationMatches) {
        stats.translationKeysUsed++;
      }

      // --- Check 7: Empty catch blocks ---
      const emptyCatch = content.match(/catch\s*\([^)]*\)\s*\{\s*\}/g);
      if (emptyCatch) {
        for (const _m of emptyCatch) {
          const idx = content.indexOf(_m);
          const lineNum = content.substring(0, idx).split('\n').length;
          issues.push({
            type: 'warning',
            category: 'error-handling',
            file: relPath,
            line: lineNum,
            message: 'Empty catch block swallows errors silently',
            suggestion: 'Add error logging or handling inside catch blocks.',
          });
        }
      }

      // --- Check 8: Hardcoded URLs/secrets ---
      lines.forEach((line, idx) => {
        if (/(?:https?:\/\/(?:localhost|127\.0\.0\.1))/.test(line) &&
          !relPath.includes('config') && !relPath.includes('vite') && !relPath.includes('.env') && !relPath.includes('test')) {
          issues.push({
            type: 'warning',
            category: 'hardcoded-url',
            file: relPath,
            line: idx + 1,
            message: 'Hardcoded localhost URL found',
            suggestion: 'Use environment variables or config for URLs.',
          });
        }
        if (/(?:api[_-]?key|secret|password|token)\s*[:=]\s*['"][^'"]{8,}['"]/i.test(line) &&
          !relPath.includes('test') && !relPath.includes('.example')) {
          issues.push({
            type: 'error',
            category: 'security',
            file: relPath,
            line: idx + 1,
            message: 'Possible hardcoded secret/API key',
            suggestion: 'Move secrets to environment variables.',
          });
        }
      });

      // --- Check 9: TODO/FIXME/HACK comments ---
      lines.forEach((line, idx) => {
        const todoMatch = line.match(/\/\/\s*(TODO|FIXME|HACK|XXX|BUG)[\s:]+(.{0,80})/i);
        if (todoMatch) {
          issues.push({
            type: 'info',
            category: 'todo',
            file: relPath,
            line: idx + 1,
            message: `${todoMatch[1].toUpperCase()}: ${todoMatch[2].trim()}`,
          });
        }
      });

      // --- Check 10: Large files ---
      if (lines.length > 500) {
        issues.push({
          type: 'warning',
          category: 'complexity',
          file: relPath,
          message: `Large file: ${lines.length} lines`,
          suggestion: 'Consider splitting into smaller components/modules.',
        });
      }

      // --- Check 11: any type usage (TypeScript) ---
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const anyCount = (content.match(/:\s*any\b/g) || []).length;
        if (anyCount > 3) {
          issues.push({
            type: 'warning',
            category: 'type-safety',
            file: relPath,
            message: `${anyCount} uses of 'any' type — weakens TypeScript safety`,
            suggestion: 'Replace any with proper types or interfaces.',
          });
        }
      }

      // --- Check 12: Missing key prop in JSX map ---
      const mapWithoutKey = content.match(/\.map\([^)]*\)\s*=>\s*(?:\([^)]*\))?\s*<(?!Fragment)[A-Z]\w+(?![^>]*\bkey\b)[^>]*>/g);
      if (mapWithoutKey) {
        issues.push({
          type: 'warning',
          category: 'react',
          file: relPath,
          message: 'Possible missing key prop in .map() JSX rendering',
          suggestion: 'Add a unique key prop to elements rendered inside .map().',
        });
      }
    }

    // --- Cross-file checks ---

    // Check for unused route definitions (routes defined but no navigation target matches)
    const uniqueRoutes = [...new Set(routeDefinitions)];
    console.log(`  Found ${uniqueRoutes.length} unique routes, ${stats.apiEndpointsFound} API calls`);
  }

  // ── Backend Audit (Django/Python) ──
  if (project.backendDir && (project.backend === 'django' || project.backend === 'python' ||
    project.backend === 'flask' || project.backend === 'fastapi')) {
    const backendFiles = findFiles(project.backendDir, ['.py']);
    stats.filesScanned += backendFiles.length;
    console.log(`  Scanning ${backendFiles.length} backend files...`);

    for (const file of backendFiles) {
      const relPath = relative(rootDir, file);
      let content: string;
      try {
        content = readFileSync(file, 'utf-8');
      } catch { continue; }

      const lines = content.split('\n');

      // --- Check: Django DEBUG = True ---
      if (basename(file) === 'settings.py' || relPath.includes('settings/')) {
        lines.forEach((line, idx) => {
          if (/DEBUG\s*=\s*True/.test(line)) {
            issues.push({
              type: 'error',
              category: 'security',
              file: relPath,
              line: idx + 1,
              message: 'DEBUG = True in settings (should be False in production)',
              suggestion: 'Use environment variable: DEBUG = os.getenv("DEBUG", "False") == "True"',
            });
          }
          if (/SECRET_KEY\s*=\s*['"][^'"]+['"]/.test(line) && !line.includes('os.') && !line.includes('env')) {
            issues.push({
              type: 'error',
              category: 'security',
              file: relPath,
              line: idx + 1,
              message: 'Hardcoded SECRET_KEY in settings',
              suggestion: 'Use environment variable: SECRET_KEY = os.getenv("SECRET_KEY")',
            });
          }
        });
      }

      // --- Check: print() statements ---
      lines.forEach((line, idx) => {
        if (/^\s*print\(/.test(line) && !relPath.includes('manage.py') && !relPath.includes('test')) {
          issues.push({
            type: 'info',
            category: 'code-quality',
            file: relPath,
            line: idx + 1,
            message: 'print() statement left in code',
            suggestion: 'Use logging module instead of print().',
          });
        }
      });

      // --- Check: Bare except ---
      lines.forEach((line, idx) => {
        if (/except\s*:/.test(line)) {
          issues.push({
            type: 'warning',
            category: 'error-handling',
            file: relPath,
            line: idx + 1,
            message: 'Bare except clause catches all exceptions',
            suggestion: 'Catch specific exceptions (e.g., except ValueError:).',
          });
        }
      });

      // --- Check: SQL injection risk ---
      lines.forEach((line, idx) => {
        if (/raw\s*\(.*%s|execute\s*\(.*f['"]|cursor\.execute\s*\(.*\+/.test(line)) {
          issues.push({
            type: 'error',
            category: 'security',
            file: relPath,
            line: idx + 1,
            message: 'Possible SQL injection: string formatting in raw SQL',
            suggestion: 'Use parameterized queries with %s placeholders.',
          });
        }
      });

      // --- Check: Missing auth on views ---
      if (relPath.includes('views') || relPath.includes('api')) {
        const hasAuthMixin = /LoginRequiredMixin|IsAuthenticated|permission_classes|@login_required/.test(content);
        const hasAPIView = /class\s+\w+\(.*(?:APIView|ViewSet|ModelViewSet|GenericAPIView)/.test(content);
        if (hasAPIView && !hasAuthMixin) {
          issues.push({
            type: 'warning',
            category: 'security',
            file: relPath,
            message: 'API view without explicit authentication/permission check',
            suggestion: 'Add permission_classes or authentication_classes to API views.',
          });
        }
      }

      // --- Check: Large files ---
      if (lines.length > 500) {
        issues.push({
          type: 'warning',
          category: 'complexity',
          file: relPath,
          message: `Large file: ${lines.length} lines`,
          suggestion: 'Consider splitting into smaller modules.',
        });
      }

      // --- Check: TODO/FIXME ---
      lines.forEach((line, idx) => {
        const todoMatch = line.match(/#\s*(TODO|FIXME|HACK|XXX|BUG)[\s:]+(.{0,80})/i);
        if (todoMatch) {
          issues.push({
            type: 'info',
            category: 'todo',
            file: relPath,
            line: idx + 1,
            message: `${todoMatch[1].toUpperCase()}: ${todoMatch[2].trim()}`,
          });
        }
      });
    }
  }

  // ── Docker / Config Audit ──
  const dockerCompose = join(rootDir, 'docker-compose.yml');
  if (existsSync(dockerCompose)) {
    const content = readFileSync(dockerCompose, 'utf-8');
    if (/DJANGO_DEBUG.*true|DEBUG.*true/i.test(content)) {
      issues.push({
        type: 'warning',
        category: 'config',
        file: 'docker-compose.yml',
        message: 'DEBUG mode appears enabled in docker-compose',
        suggestion: 'Ensure DEBUG is false for production docker-compose files.',
      });
    }
  }

  // Check for .env files committed
  const envFiles = ['.env', '.env.local', '.env.production'];
  for (const envFile of envFiles) {
    const envPath = join(rootDir, envFile);
    if (existsSync(envPath)) {
      const gitignore = existsSync(join(rootDir, '.gitignore'))
        ? readFileSync(join(rootDir, '.gitignore'), 'utf-8')
        : '';
      if (!gitignore.includes(envFile)) {
        issues.push({
          type: 'error',
          category: 'security',
          file: envFile,
          message: `${envFile} exists but may not be in .gitignore`,
          suggestion: `Add ${envFile} to .gitignore to prevent committing secrets.`,
        });
      }
    }
  }

  const duration = Date.now() - startTime;
  const errors = issues.filter(i => i.type === 'error').length;
  const warnings = issues.filter(i => i.type === 'warning').length;
  const info = issues.filter(i => i.type === 'info').length;

  return {
    agent: 'inclufy-uat-agent',
    mode: 'code-audit',
    source: rootDir,
    timestamp: new Date().toISOString(),
    duration,
    stats,
    issues,
    summary: { errors, warnings, info, total: issues.length },
  };
}

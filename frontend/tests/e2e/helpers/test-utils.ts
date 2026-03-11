/**
 * Shared UAT Test Helpers
 * Common auth, navigation, and assertion utilities for all Playwright tests.
 */
import { Page, expect } from '@playwright/test'

// ─── Auth ────────────────────────────────────────────────────────────

export async function login(page: Page, email = 'test@example.com', password = 'testpassword123') {
  await page.goto('/login')
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL(/dashboard|projects/, { timeout: 15000 })
}

// ─── Navigation ──────────────────────────────────────────────────────

/** Navigate to projects list, then open the first project matching a methodology */
export async function navigateToProject(page: Page, methodology: string) {
  await page.goto('/projects')
  await page.waitForLoadState('networkidle')

  // Click the first project link that contains the methodology name
  const projectLink = page.locator(`a:has-text("${methodology}"), tr:has-text("${methodology}")`)
  if (await projectLink.count() > 0) {
    await projectLink.first().click()
    await page.waitForLoadState('networkidle')
    return true
  }
  return false
}

/** Navigate directly to a methodology sub-page for a project */
export async function navigateToMethodologyPage(
  page: Page,
  projectId: string,
  methodology: string,
  subPage: string,
) {
  await page.goto(`/projects/${projectId}/${methodology}/${subPage}`)
  await page.waitForLoadState('networkidle')
}

// ─── Sidebar Navigation ─────────────────────────────────────────────

/** Click a sidebar link by text (case-insensitive) */
export async function clickSidebarLink(page: Page, label: string) {
  const link = page.locator(`nav a:has-text("${label}"), aside a:has-text("${label}")`)
  if (await link.count() > 0) {
    await link.first().click()
    await page.waitForLoadState('networkidle')
    return true
  }
  return false
}

// ─── Dialog / Form ───────────────────────────────────────────────────

/** Open a dialog by clicking a button with the given text */
export async function openDialog(page: Page, buttonText: string) {
  const btn = page.locator(`button:has-text("${buttonText}")`)
  if (await btn.count() > 0) {
    await btn.first().click()
    // Wait for dialog to appear
    await page.waitForSelector('[role="dialog"], [data-state="open"]', { timeout: 5000 })
    return true
  }
  return false
}

/** Fill a form field inside a dialog */
export async function fillField(page: Page, selector: string, value: string) {
  const field = page.locator(selector)
  if (await field.count() > 0) {
    await field.first().fill(value)
  }
}

/** Submit a dialog form */
export async function submitDialog(page: Page, buttonText = 'Save') {
  const submit = page.locator(
    `[role="dialog"] button:has-text("${buttonText}"), [role="dialog"] button[type="submit"]`,
  )
  if (await submit.count() > 0) {
    await submit.first().click()
    await page.waitForLoadState('networkidle')
  }
}

// ─── Assertions ──────────────────────────────────────────────────────

/** Assert a page heading or major text is visible */
export async function expectHeadingVisible(page: Page, text: string | RegExp, timeout = 10000) {
  await expect(page.locator(`h1, h2, h3`).filter({ hasText: text })).toBeVisible({ timeout })
}

/** Assert page contains text (case-insensitive) */
export async function expectTextVisible(page: Page, text: string | RegExp, timeout = 10000) {
  const pattern = typeof text === 'string' ? new RegExp(text, 'i') : text
  await expect(page.locator(`text=${pattern.source}`).first()).toBeVisible({ timeout })
}

/** Assert a toast notification appears */
export async function expectToast(page: Page, text: string | RegExp) {
  const toast = page.locator('[data-sonner-toast], [role="status"]').filter({ hasText: text })
  await expect(toast.first()).toBeVisible({ timeout: 8000 })
}

/** Assert the page loaded without error (no 404/500 etc.) */
export async function expectNoError(page: Page) {
  const errorTexts = page.locator('text=/404|not found|500|server error|something went wrong/i')
  const count = await errorTexts.count()
  // Tolerate if these words appear inside normal content, but flag standalone error pages
  const h1Error = page.locator('h1').filter({ hasText: /404|500|error/i })
  expect(await h1Error.count()).toBe(0)
}

// ─── Loading ─────────────────────────────────────────────────────────

/** Wait for loading spinners to disappear */
export async function waitForLoading(page: Page, timeout = 15000) {
  const spinner = page.locator('.animate-spin, [data-loading="true"]')
  if (await spinner.count() > 0) {
    await spinner.first().waitFor({ state: 'hidden', timeout })
  }
}

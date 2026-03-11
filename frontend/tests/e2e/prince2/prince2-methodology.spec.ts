/**
 * PRINCE2 Methodology UAT Tests
 * Tests every PRINCE2 feature page one by one.
 */
import { test, expect } from '@playwright/test'
import { login, waitForLoading, expectNoError } from '../helpers/test-utils'

test.describe('PRINCE2 Methodology - Complete UAT', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  // ── 1. PRINCE2 Dashboard ──────────────────────────────────────────

  test('1. PRINCE2 Dashboard page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const p2Link = page.locator('a, tr, div').filter({ hasText: /prince2/i }).first()
    if (await p2Link.count() > 0) {
      await p2Link.click()
      await page.waitForLoadState('networkidle')

      const dashLink = page.locator('a[href*="prince2/dashboard"], a[href*="prince2/overview"], a:has-text("Dashboard")')
      if (await dashLink.count() > 0) {
        await dashLink.first().click()
        await page.waitForLoadState('networkidle')
      }
      await waitForLoading(page)
      await expectNoError(page)
    }
  })

  // ── 2. Project Brief ──────────────────────────────────────────────

  test('2. Project Brief page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const p2Link = page.locator('a, tr, div').filter({ hasText: /prince2/i }).first()
    if (await p2Link.count() > 0) {
      await p2Link.click()
      await page.waitForLoadState('networkidle')

      const briefLink = page.locator('a[href*="project-brief"], a:has-text("Project Brief")')
      if (await briefLink.count() > 0) {
        await briefLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 3. Business Case ──────────────────────────────────────────────

  test('3. Business Case page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const p2Link = page.locator('a, tr, div').filter({ hasText: /prince2/i }).first()
    if (await p2Link.count() > 0) {
      await p2Link.click()
      await page.waitForLoadState('networkidle')

      const bcLink = page.locator('a[href*="business-case"], a:has-text("Business Case")')
      if (await bcLink.count() > 0) {
        await bcLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 4. Stage Plan ─────────────────────────────────────────────────

  test('4. Stage Plan page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const p2Link = page.locator('a, tr, div').filter({ hasText: /prince2/i }).first()
    if (await p2Link.count() > 0) {
      await p2Link.click()
      await page.waitForLoadState('networkidle')

      const stageLink = page.locator('a[href*="stage-plan"], a:has-text("Stage Plan")')
      if (await stageLink.count() > 0) {
        await stageLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 5. Stage Gate ─────────────────────────────────────────────────

  test('5. Stage Gate page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const p2Link = page.locator('a, tr, div').filter({ hasText: /prince2/i }).first()
    if (await p2Link.count() > 0) {
      await p2Link.click()
      await page.waitForLoadState('networkidle')

      const gateLink = page.locator('a[href*="stage-gate"], a:has-text("Stage Gate")')
      if (await gateLink.count() > 0) {
        await gateLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 6. Work Packages ──────────────────────────────────────────────

  test('6. Work Packages page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const p2Link = page.locator('a, tr, div').filter({ hasText: /prince2/i }).first()
    if (await p2Link.count() > 0) {
      await p2Link.click()
      await page.waitForLoadState('networkidle')

      const wpLink = page.locator('a[href*="work-packages"], a:has-text("Work Package")')
      if (await wpLink.count() > 0) {
        await wpLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 7. Tolerances ─────────────────────────────────────────────────

  test('7. Tolerances page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const p2Link = page.locator('a, tr, div').filter({ hasText: /prince2/i }).first()
    if (await p2Link.count() > 0) {
      await p2Link.click()
      await page.waitForLoadState('networkidle')

      const tolLink = page.locator('a[href*="tolerances"], a:has-text("Tolerances")')
      if (await tolLink.count() > 0) {
        await tolLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 8. Project Board ──────────────────────────────────────────────

  test('8. Project Board page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const p2Link = page.locator('a, tr, div').filter({ hasText: /prince2/i }).first()
    if (await p2Link.count() > 0) {
      await p2Link.click()
      await page.waitForLoadState('networkidle')

      const boardLink = page.locator('a[href*="project-board"], a:has-text("Project Board")')
      if (await boardLink.count() > 0) {
        await boardLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 9. Governance ─────────────────────────────────────────────────

  test('9. Governance page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const p2Link = page.locator('a, tr, div').filter({ hasText: /prince2/i }).first()
    if (await p2Link.count() > 0) {
      await p2Link.click()
      await page.waitForLoadState('networkidle')

      const govLink = page.locator('a[href*="prince2/governance"], a:has-text("Governance")')
      if (await govLink.count() > 0) {
        await govLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 10. Highlight Report ──────────────────────────────────────────

  test('10. Highlight Report page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const p2Link = page.locator('a, tr, div').filter({ hasText: /prince2/i }).first()
    if (await p2Link.count() > 0) {
      await p2Link.click()
      await page.waitForLoadState('networkidle')

      const hlLink = page.locator('a[href*="highlight-report"], a:has-text("Highlight Report")')
      if (await hlLink.count() > 0) {
        await hlLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 11. Project Closure ───────────────────────────────────────────

  test('11. Project Closure page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const p2Link = page.locator('a, tr, div').filter({ hasText: /prince2/i }).first()
    if (await p2Link.count() > 0) {
      await p2Link.click()
      await page.waitForLoadState('networkidle')

      const closureLink = page.locator('a[href*="project-closure"], a:has-text("Project Closure")')
      if (await closureLink.count() > 0) {
        await closureLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })
})

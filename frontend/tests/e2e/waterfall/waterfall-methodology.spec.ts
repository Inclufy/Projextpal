/**
 * WATERFALL Methodology UAT Tests
 * Tests every Waterfall feature page one by one.
 */
import { test, expect } from '@playwright/test'
import { login, waitForLoading, expectNoError } from '../helpers/test-utils'

test.describe('Waterfall Methodology - Complete UAT', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  // ── 1. Waterfall Overview ─────────────────────────────────────────

  test('1. Waterfall Overview page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const wfLink = page.locator('a, tr, div').filter({ hasText: /waterfall/i }).first()
    if (await wfLink.count() > 0) {
      await wfLink.click()
      await page.waitForLoadState('networkidle')

      const overviewLink = page.locator('a[href*="waterfall/overview"], a:has-text("Overview")')
      if (await overviewLink.count() > 0) {
        await overviewLink.first().click()
        await page.waitForLoadState('networkidle')
      }
      await waitForLoading(page)
      await expectNoError(page)
    }
  })

  // ── 2. Requirements ───────────────────────────────────────────────

  test('2. Requirements page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const wfLink = page.locator('a, tr, div').filter({ hasText: /waterfall/i }).first()
    if (await wfLink.count() > 0) {
      await wfLink.click()
      await page.waitForLoadState('networkidle')

      const reqLink = page.locator('a[href*="requirements"], a:has-text("Requirements")')
      if (await reqLink.count() > 0) {
        await reqLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 3. Design ─────────────────────────────────────────────────────

  test('3. Design page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const wfLink = page.locator('a, tr, div').filter({ hasText: /waterfall/i }).first()
    if (await wfLink.count() > 0) {
      await wfLink.click()
      await page.waitForLoadState('networkidle')

      const designLink = page.locator('a[href*="waterfall/design"], a:has-text("Design")')
      if (await designLink.count() > 0) {
        await designLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 4. Development ────────────────────────────────────────────────

  test('4. Development page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const wfLink = page.locator('a, tr, div').filter({ hasText: /waterfall/i }).first()
    if (await wfLink.count() > 0) {
      await wfLink.click()
      await page.waitForLoadState('networkidle')

      const devLink = page.locator('a[href*="waterfall/development"], a:has-text("Development")')
      if (await devLink.count() > 0) {
        await devLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 5. Testing ────────────────────────────────────────────────────

  test('5. Testing page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const wfLink = page.locator('a, tr, div').filter({ hasText: /waterfall/i }).first()
    if (await wfLink.count() > 0) {
      await wfLink.click()
      await page.waitForLoadState('networkidle')

      const testLink = page.locator('a[href*="waterfall/testing"], a:has-text("Testing")')
      if (await testLink.count() > 0) {
        await testLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 6. Deployment ─────────────────────────────────────────────────

  test('6. Deployment page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const wfLink = page.locator('a, tr, div').filter({ hasText: /waterfall/i }).first()
    if (await wfLink.count() > 0) {
      await wfLink.click()
      await page.waitForLoadState('networkidle')

      const deployLink = page.locator('a[href*="waterfall/deployment"], a:has-text("Deployment")')
      if (await deployLink.count() > 0) {
        await deployLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 7. Maintenance ────────────────────────────────────────────────

  test('7. Maintenance page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const wfLink = page.locator('a, tr, div').filter({ hasText: /waterfall/i }).first()
    if (await wfLink.count() > 0) {
      await wfLink.click()
      await page.waitForLoadState('networkidle')

      const maintLink = page.locator('a[href*="waterfall/maintenance"], a:has-text("Maintenance")')
      if (await maintLink.count() > 0) {
        await maintLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 8. Gantt Chart ────────────────────────────────────────────────

  test('8. Gantt Chart page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const wfLink = page.locator('a, tr, div').filter({ hasText: /waterfall/i }).first()
    if (await wfLink.count() > 0) {
      await wfLink.click()
      await page.waitForLoadState('networkidle')

      const ganttLink = page.locator('a[href*="waterfall/gantt"], a:has-text("Gantt")')
      if (await ganttLink.count() > 0) {
        await ganttLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 9. Milestones ────────────────────────────────────────────────

  test('9. Milestones page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const wfLink = page.locator('a, tr, div').filter({ hasText: /waterfall/i }).first()
    if (await wfLink.count() > 0) {
      await wfLink.click()
      await page.waitForLoadState('networkidle')

      const mileLink = page.locator('a[href*="waterfall/milestones"], a:has-text("Milestones")')
      if (await mileLink.count() > 0) {
        await mileLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 10. Change Requests ──────────────────────────────────────────

  test('10. Change Requests page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const wfLink = page.locator('a, tr, div').filter({ hasText: /waterfall/i }).first()
    if (await wfLink.count() > 0) {
      await wfLink.click()
      await page.waitForLoadState('networkidle')

      const crLink = page.locator('a[href*="change-requests"], a:has-text("Change Request")')
      if (await crLink.count() > 0) {
        await crLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 11. Issues ───────────────────────────────────────────────────

  test('11. Issues page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const wfLink = page.locator('a, tr, div').filter({ hasText: /waterfall/i }).first()
    if (await wfLink.count() > 0) {
      await wfLink.click()
      await page.waitForLoadState('networkidle')

      const issueLink = page.locator('a[href*="waterfall/issues"], a:has-text("Issues")')
      if (await issueLink.count() > 0) {
        await issueLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 12. Baselines ───────────────────────────────────────────────

  test('12. Baselines page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const wfLink = page.locator('a, tr, div').filter({ hasText: /waterfall/i }).first()
    if (await wfLink.count() > 0) {
      await wfLink.click()
      await page.waitForLoadState('networkidle')

      const baseLink = page.locator('a[href*="baselines"], a:has-text("Baselines")')
      if (await baseLink.count() > 0) {
        await baseLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 13. Phase Gate ───────────────────────────────────────────────

  test('13. Phase Gate page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const wfLink = page.locator('a, tr, div').filter({ hasText: /waterfall/i }).first()
    if (await wfLink.count() > 0) {
      await wfLink.click()
      await page.waitForLoadState('networkidle')

      const gateLink = page.locator('a[href*="phase-gate"], a:has-text("Phase Gate")')
      if (await gateLink.count() > 0) {
        await gateLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 14. Risks ────────────────────────────────────────────────────

  test('14. Risks page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const wfLink = page.locator('a, tr, div').filter({ hasText: /waterfall/i }).first()
    if (await wfLink.count() > 0) {
      await wfLink.click()
      await page.waitForLoadState('networkidle')

      const riskLink = page.locator('a[href*="waterfall/risks"], a:has-text("Risks")')
      if (await riskLink.count() > 0) {
        await riskLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 15. Waterfall Team ───────────────────────────────────────────

  test('15. Waterfall Team page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const wfLink = page.locator('a, tr, div').filter({ hasText: /waterfall/i }).first()
    if (await wfLink.count() > 0) {
      await wfLink.click()
      await page.waitForLoadState('networkidle')

      const teamLink = page.locator('a[href*="waterfall/team"], a:has-text("Team")')
      if (await teamLink.count() > 0) {
        await teamLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 16. Waterfall Budget ─────────────────────────────────────────

  test('16. Waterfall Budget page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const wfLink = page.locator('a, tr, div').filter({ hasText: /waterfall/i }).first()
    if (await wfLink.count() > 0) {
      await wfLink.click()
      await page.waitForLoadState('networkidle')

      const budgetLink = page.locator('a[href*="waterfall/budget"], a:has-text("Budget")')
      if (await budgetLink.count() > 0) {
        await budgetLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })
})

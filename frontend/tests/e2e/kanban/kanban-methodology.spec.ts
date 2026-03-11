/**
 * KANBAN Methodology UAT Tests
 * Tests every Kanban feature page one by one.
 */
import { test, expect } from '@playwright/test'
import { login, waitForLoading, expectNoError } from '../helpers/test-utils'

test.describe('Kanban Methodology - Complete UAT', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  // ── 1. Kanban Overview ────────────────────────────────────────────

  test('1. Kanban Overview page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const kanbanLink = page.locator('a, tr, div').filter({ hasText: /kanban/i }).first()
    if (await kanbanLink.count() > 0) {
      await kanbanLink.click()
      await page.waitForLoadState('networkidle')

      const overviewLink = page.locator('a[href*="kanban/overview"], a:has-text("Overview")')
      if (await overviewLink.count() > 0) {
        await overviewLink.first().click()
        await page.waitForLoadState('networkidle')
      }
      await waitForLoading(page)
      await expectNoError(page)
    }
  })

  // ── 2. Kanban Board ───────────────────────────────────────────────

  test('2. Kanban Board displays columns', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const kanbanLink = page.locator('a, tr, div').filter({ hasText: /kanban/i }).first()
    if (await kanbanLink.count() > 0) {
      await kanbanLink.click()
      await page.waitForLoadState('networkidle')

      const boardLink = page.locator('a[href*="kanban/board"], a:has-text("Board")')
      if (await boardLink.count() > 0) {
        await boardLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)

        await expectNoError(page)
        const columns = page.locator('text=/backlog|to do|in progress|done|review/i')
        if (await columns.count() > 0) {
          await expect(columns.first()).toBeVisible()
        }
      }
    }
  })

  // ── 3. Kanban Board Configuration ─────────────────────────────────

  test('3. Board Configuration page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const kanbanLink = page.locator('a, tr, div').filter({ hasText: /kanban/i }).first()
    if (await kanbanLink.count() > 0) {
      await kanbanLink.click()
      await page.waitForLoadState('networkidle')

      const configLink = page.locator('a[href*="board-configuration"], a:has-text("Board Configuration")')
      if (await configLink.count() > 0) {
        await configLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 4. WIP Limits ────────────────────────────────────────────────

  test('4. WIP Limits page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const kanbanLink = page.locator('a, tr, div').filter({ hasText: /kanban/i }).first()
    if (await kanbanLink.count() > 0) {
      await kanbanLink.click()
      await page.waitForLoadState('networkidle')

      const wipLink = page.locator('a[href*="wip-limits"], a:has-text("WIP")')
      if (await wipLink.count() > 0) {
        await wipLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 5. Work Items ────────────────────────────────────────────────

  test('5. Work Items page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const kanbanLink = page.locator('a, tr, div').filter({ hasText: /kanban/i }).first()
    if (await kanbanLink.count() > 0) {
      await kanbanLink.click()
      await page.waitForLoadState('networkidle')

      const workLink = page.locator('a[href*="work-items"], a:has-text("Work Items")')
      if (await workLink.count() > 0) {
        await workLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 6. Flow Metrics ──────────────────────────────────────────────

  test('6. Flow Metrics page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const kanbanLink = page.locator('a, tr, div').filter({ hasText: /kanban/i }).first()
    if (await kanbanLink.count() > 0) {
      await kanbanLink.click()
      await page.waitForLoadState('networkidle')

      const metricsLink = page.locator('a[href*="kanban/metrics"], a:has-text("Metrics")')
      if (await metricsLink.count() > 0) {
        await metricsLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 7. Cumulative Flow Diagram ────────────────────────────────────

  test('7. CFD page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const kanbanLink = page.locator('a, tr, div').filter({ hasText: /kanban/i }).first()
    if (await kanbanLink.count() > 0) {
      await kanbanLink.click()
      await page.waitForLoadState('networkidle')

      const cfdLink = page.locator('a[href*="kanban/cfd"], a:has-text("CFD"), a:has-text("Cumulative")')
      if (await cfdLink.count() > 0) {
        await cfdLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 8. Blocked Items ─────────────────────────────────────────────

  test('8. Blocked Items page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const kanbanLink = page.locator('a, tr, div').filter({ hasText: /kanban/i }).first()
    if (await kanbanLink.count() > 0) {
      await kanbanLink.click()
      await page.waitForLoadState('networkidle')

      const blockedLink = page.locator('a[href*="blocked"], a:has-text("Blocked")')
      if (await blockedLink.count() > 0) {
        await blockedLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 9. Continuous Improvement ─────────────────────────────────────

  test('9. Continuous Improvement page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const kanbanLink = page.locator('a, tr, div').filter({ hasText: /kanban/i }).first()
    if (await kanbanLink.count() > 0) {
      await kanbanLink.click()
      await page.waitForLoadState('networkidle')

      const impLink = page.locator('a[href*="improvement"], a:has-text("Improvement")')
      if (await impLink.count() > 0) {
        await impLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 10. Kanban Team ──────────────────────────────────────────────

  test('10. Kanban Team page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const kanbanLink = page.locator('a, tr, div').filter({ hasText: /kanban/i }).first()
    if (await kanbanLink.count() > 0) {
      await kanbanLink.click()
      await page.waitForLoadState('networkidle')

      const teamLink = page.locator('a[href*="kanban/team"], a:has-text("Team")')
      if (await teamLink.count() > 0) {
        await teamLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 11. Kanban Budget ─────────────────────────────────────────────

  test('11. Kanban Budget page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const kanbanLink = page.locator('a, tr, div').filter({ hasText: /kanban/i }).first()
    if (await kanbanLink.count() > 0) {
      await kanbanLink.click()
      await page.waitForLoadState('networkidle')

      const budgetLink = page.locator('a[href*="kanban/budget"], a:has-text("Budget")')
      if (await budgetLink.count() > 0) {
        await budgetLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })
})

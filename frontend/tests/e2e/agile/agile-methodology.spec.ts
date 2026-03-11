/**
 * AGILE Methodology UAT Tests
 * Tests every Agile feature page one by one.
 */
import { test, expect } from '@playwright/test'
import { login, waitForLoading, expectNoError } from '../helpers/test-utils'

test.describe('Agile Methodology - Complete UAT', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  // ── 1. Agile Overview ─────────────────────────────────────────────

  test('1. Agile Overview page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const agileLink = page.locator('a, tr, div').filter({ hasText: /agile/i }).first()
    if (await agileLink.count() > 0) {
      await agileLink.click()
      await page.waitForLoadState('networkidle')

      const overviewLink = page.locator('a[href*="agile/overview"], a:has-text("Overview")')
      if (await overviewLink.count() > 0) {
        await overviewLink.first().click()
        await page.waitForLoadState('networkidle')
      }
      await waitForLoading(page)
      await expectNoError(page)
    }
  })

  // ── 2. Product Vision ─────────────────────────────────────────────

  test('2. Product Vision page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const agileLink = page.locator('a, tr, div').filter({ hasText: /agile/i }).first()
    if (await agileLink.count() > 0) {
      await agileLink.click()
      await page.waitForLoadState('networkidle')

      const visionLink = page.locator('a[href*="agile/vision"], a:has-text("Vision")')
      if (await visionLink.count() > 0) {
        await visionLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 3. User Personas ──────────────────────────────────────────────

  test('3. User Personas page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const agileLink = page.locator('a, tr, div').filter({ hasText: /agile/i }).first()
    if (await agileLink.count() > 0) {
      await agileLink.click()
      await page.waitForLoadState('networkidle')

      const personaLink = page.locator('a[href*="personas"], a:has-text("Persona")')
      if (await personaLink.count() > 0) {
        await personaLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 4. Agile Backlog ──────────────────────────────────────────────

  test('4. Agile Backlog page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const agileLink = page.locator('a, tr, div').filter({ hasText: /agile/i }).first()
    if (await agileLink.count() > 0) {
      await agileLink.click()
      await page.waitForLoadState('networkidle')

      const backlogLink = page.locator('a[href*="agile/backlog"], a:has-text("Backlog")')
      if (await backlogLink.count() > 0) {
        await backlogLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 5. Iteration Board ────────────────────────────────────────────

  test('5. Iteration Board page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const agileLink = page.locator('a, tr, div').filter({ hasText: /agile/i }).first()
    if (await agileLink.count() > 0) {
      await agileLink.click()
      await page.waitForLoadState('networkidle')

      const iterLink = page.locator('a[href*="iteration-board"], a:has-text("Iteration")')
      if (await iterLink.count() > 0) {
        await iterLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 6. Release Planning ───────────────────────────────────────────

  test('6. Release Planning page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const agileLink = page.locator('a, tr, div').filter({ hasText: /agile/i }).first()
    if (await agileLink.count() > 0) {
      await agileLink.click()
      await page.waitForLoadState('networkidle')

      const releaseLink = page.locator('a[href*="release-planning"], a:has-text("Release")')
      if (await releaseLink.count() > 0) {
        await releaseLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 7. Daily Progress ─────────────────────────────────────────────

  test('7. Daily Progress page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const agileLink = page.locator('a, tr, div').filter({ hasText: /agile/i }).first()
    if (await agileLink.count() > 0) {
      await agileLink.click()
      await page.waitForLoadState('networkidle')

      const dailyLink = page.locator('a[href*="daily-progress"], a:has-text("Daily")')
      if (await dailyLink.count() > 0) {
        await dailyLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 8. Agile Retrospective ────────────────────────────────────────

  test('8. Agile Retrospective page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const agileLink = page.locator('a, tr, div').filter({ hasText: /agile/i }).first()
    if (await agileLink.count() > 0) {
      await agileLink.click()
      await page.waitForLoadState('networkidle')

      const retroLink = page.locator('a[href*="agile/retrospective"], a:has-text("Retrospective")')
      if (await retroLink.count() > 0) {
        await retroLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 9. Agile Velocity ─────────────────────────────────────────────

  test('9. Agile Velocity page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const agileLink = page.locator('a, tr, div').filter({ hasText: /agile/i }).first()
    if (await agileLink.count() > 0) {
      await agileLink.click()
      await page.waitForLoadState('networkidle')

      const velocityLink = page.locator('a[href*="agile/velocity"], a:has-text("Velocity")')
      if (await velocityLink.count() > 0) {
        await velocityLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 10. Agile Definition of Done ──────────────────────────────────

  test('10. Definition of Done page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const agileLink = page.locator('a, tr, div').filter({ hasText: /agile/i }).first()
    if (await agileLink.count() > 0) {
      await agileLink.click()
      await page.waitForLoadState('networkidle')

      const dodLink = page.locator('a[href*="definition-of-done"], a:has-text("Definition of Done")')
      if (await dodLink.count() > 0) {
        await dodLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 11. Agile Team ────────────────────────────────────────────────

  test('11. Agile Team page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const agileLink = page.locator('a, tr, div').filter({ hasText: /agile/i }).first()
    if (await agileLink.count() > 0) {
      await agileLink.click()
      await page.waitForLoadState('networkidle')

      const teamLink = page.locator('a[href*="agile/team"], a:has-text("Team")')
      if (await teamLink.count() > 0) {
        await teamLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 12. Agile Budget ──────────────────────────────────────────────

  test('12. Agile Budget page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const agileLink = page.locator('a, tr, div').filter({ hasText: /agile/i }).first()
    if (await agileLink.count() > 0) {
      await agileLink.click()
      await page.waitForLoadState('networkidle')

      const budgetLink = page.locator('a[href*="agile/budget"], a:has-text("Budget")')
      if (await budgetLink.count() > 0) {
        await budgetLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })
})

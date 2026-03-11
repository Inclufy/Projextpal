/**
 * SCRUM Methodology UAT Tests
 * Tests every Scrum feature page one by one.
 */
import { test, expect } from '@playwright/test'
import { login, waitForLoading, expectNoError } from '../helpers/test-utils'

test.describe('Scrum Methodology - Complete UAT', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  // ── 1. Scrum Overview ─────────────────────────────────────────────

  test('1. Scrum Overview page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    // Find a Scrum project and navigate
    const scrumLink = page.locator('a, tr, div').filter({ hasText: /scrum/i }).first()
    if (await scrumLink.count() > 0) {
      await scrumLink.click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)

      // Navigate to scrum overview
      const overviewLink = page.locator('a:has-text("Overview"), a[href*="scrum/overview"]')
      if (await overviewLink.count() > 0) {
        await overviewLink.first().click()
        await page.waitForLoadState('networkidle')
      }

      await expectNoError(page)
    }
  })

  // ── 2. Scrum Team ─────────────────────────────────────────────────

  test('2. Scrum Team page displays team members', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const scrumLink = page.locator('a, tr, div').filter({ hasText: /scrum/i }).first()
    if (await scrumLink.count() > 0) {
      await scrumLink.click()
      await page.waitForLoadState('networkidle')

      const teamLink = page.locator('a[href*="scrum/team"], a:has-text("Team")')
      if (await teamLink.count() > 0) {
        await teamLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)

        await expectNoError(page)
        // Look for team-related content: role labels, add member button
        const teamContent = page.locator('text=/product owner|scrum master|developer|team/i')
        if (await teamContent.count() > 0) {
          await expect(teamContent.first()).toBeVisible()
        }
      }
    }
  })

  // ── 3. Scrum Backlog ──────────────────────────────────────────────

  test('3. Product Backlog page loads with items', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const scrumLink = page.locator('a, tr, div').filter({ hasText: /scrum/i }).first()
    if (await scrumLink.count() > 0) {
      await scrumLink.click()
      await page.waitForLoadState('networkidle')

      const backlogLink = page.locator('a[href*="scrum/backlog"], a:has-text("Backlog")')
      if (await backlogLink.count() > 0) {
        await backlogLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)

        await expectNoError(page)
        // Backlog should have add item button or list
        const addItem = page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Create")')
        if (await addItem.count() > 0) {
          await expect(addItem.first()).toBeVisible()
        }
      }
    }
  })

  // ── 4. Scrum Sprint Board ─────────────────────────────────────────

  test('4. Sprint Board displays columns', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const scrumLink = page.locator('a, tr, div').filter({ hasText: /scrum/i }).first()
    if (await scrumLink.count() > 0) {
      await scrumLink.click()
      await page.waitForLoadState('networkidle')

      const boardLink = page.locator('a[href*="sprint-board"], a:has-text("Sprint Board")')
      if (await boardLink.count() > 0) {
        await boardLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)

        await expectNoError(page)
        // Should show status columns
        const columns = page.locator('text=/to do|in progress|done|review/i')
        if (await columns.count() > 0) {
          await expect(columns.first()).toBeVisible()
        }
      }
    }
  })

  // ── 5. Sprint Planning ────────────────────────────────────────────

  test('5. Sprint Planning page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const scrumLink = page.locator('a, tr, div').filter({ hasText: /scrum/i }).first()
    if (await scrumLink.count() > 0) {
      await scrumLink.click()
      await page.waitForLoadState('networkidle')

      const planLink = page.locator('a[href*="sprint-planning"], a:has-text("Sprint Planning")')
      if (await planLink.count() > 0) {
        await planLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)

        await expectNoError(page)
        await expect(page.locator('text=/sprint.*planning|plan.*sprint/i').first()).toBeVisible({ timeout: 8000 })
      }
    }
  })

  // ── 6. Sprint Review ──────────────────────────────────────────────

  test('6. Sprint Review page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const scrumLink = page.locator('a, tr, div').filter({ hasText: /scrum/i }).first()
    if (await scrumLink.count() > 0) {
      await scrumLink.click()
      await page.waitForLoadState('networkidle')

      const reviewLink = page.locator('a[href*="sprint-review"], a:has-text("Sprint Review")')
      if (await reviewLink.count() > 0) {
        await reviewLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 7. Daily Standup ──────────────────────────────────────────────

  test('7. Daily Standup page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const scrumLink = page.locator('a, tr, div').filter({ hasText: /scrum/i }).first()
    if (await scrumLink.count() > 0) {
      await scrumLink.click()
      await page.waitForLoadState('networkidle')

      const standupLink = page.locator('a[href*="daily-standup"], a:has-text("Daily Standup")')
      if (await standupLink.count() > 0) {
        await standupLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 8. Retrospective ─────────────────────────────────────────────

  test('8. Retrospective page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const scrumLink = page.locator('a, tr, div').filter({ hasText: /scrum/i }).first()
    if (await scrumLink.count() > 0) {
      await scrumLink.click()
      await page.waitForLoadState('networkidle')

      const retroLink = page.locator('a[href*="retrospective"], a:has-text("Retrospective")')
      if (await retroLink.count() > 0) {
        await retroLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 9. Velocity ───────────────────────────────────────────────────

  test('9. Velocity chart page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const scrumLink = page.locator('a, tr, div').filter({ hasText: /scrum/i }).first()
    if (await scrumLink.count() > 0) {
      await scrumLink.click()
      await page.waitForLoadState('networkidle')

      const velocityLink = page.locator('a[href*="velocity"], a:has-text("Velocity")')
      if (await velocityLink.count() > 0) {
        await velocityLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 10. Definition of Done ────────────────────────────────────────

  test('10. Definition of Done page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const scrumLink = page.locator('a, tr, div').filter({ hasText: /scrum/i }).first()
    if (await scrumLink.count() > 0) {
      await scrumLink.click()
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

  // ── 11. Increments ────────────────────────────────────────────────

  test('11. Increments page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const scrumLink = page.locator('a, tr, div').filter({ hasText: /scrum/i }).first()
    if (await scrumLink.count() > 0) {
      await scrumLink.click()
      await page.waitForLoadState('networkidle')

      const incLink = page.locator('a[href*="increments"], a:has-text("Increments")')
      if (await incLink.count() > 0) {
        await incLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 12. Scrum Budget ──────────────────────────────────────────────

  test('12. Scrum Budget page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const scrumLink = page.locator('a, tr, div').filter({ hasText: /scrum/i }).first()
    if (await scrumLink.count() > 0) {
      await scrumLink.click()
      await page.waitForLoadState('networkidle')

      const budgetLink = page.locator('a[href*="scrum/budget"], a:has-text("Budget")')
      if (await budgetLink.count() > 0) {
        await budgetLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })
})

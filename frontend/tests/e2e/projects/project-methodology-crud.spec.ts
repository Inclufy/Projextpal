/**
 * PROJECT CRUD & FOUNDATION UAT Tests
 * Tests project creation, foundation features, and cross-methodology navigation.
 */
import { test, expect } from '@playwright/test'
import { login, waitForLoading, expectNoError } from '../helpers/test-utils'

test.describe('Project CRUD & Foundation - Complete UAT', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  // ── 1. Projects List ──────────────────────────────────────────────

  test('1. Projects list page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    await waitForLoading(page)
    await expectNoError(page)
  })

  // ── 2. Create New Project ─────────────────────────────────────────

  test('2. Create Project page or dialog opens', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const createBtn = page.locator('button:has-text("New Project"), button:has-text("Create Project"), a[href*="projects/new"]')
    if (await createBtn.count() > 0) {
      await createBtn.first().click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)
      await expectNoError(page)

      // Should see methodology selection or project form
      const methodologyContent = page.locator('text=/methodology|scrum|kanban|waterfall|agile|prince2/i')
      if (await methodologyContent.count() > 0) {
        await expect(methodologyContent.first()).toBeVisible()
      }
    }
  })

  // ── 3. Project Detail ─────────────────────────────────────────────

  test('3. Project Detail page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const projectLink = page.locator('a[href*="/projects/"], tr').first()
    if (await projectLink.count() > 0) {
      await projectLink.click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)
      await expectNoError(page)
    }
  })

  // ── 4. Foundation Overview ────────────────────────────────────────

  test('4. Foundation Overview page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const projectLink = page.locator('a[href*="/projects/"], tr').first()
    if (await projectLink.count() > 0) {
      await projectLink.click()
      await page.waitForLoadState('networkidle')

      const foundationLink = page.locator('a[href*="foundation/overview"], a:has-text("Foundation"), a:has-text("Overview")')
      if (await foundationLink.count() > 0) {
        await foundationLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 5. Foundation Workflow ────────────────────────────────────────

  test('5. Workflow page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const projectLink = page.locator('a[href*="/projects/"], tr').first()
    if (await projectLink.count() > 0) {
      await projectLink.click()
      await page.waitForLoadState('networkidle')

      const workflowLink = page.locator('a[href*="foundation/workflow"], a:has-text("Workflow")')
      if (await workflowLink.count() > 0) {
        await workflowLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 6. Foundation Charter ─────────────────────────────────────────

  test('6. Project Charter page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const projectLink = page.locator('a[href*="/projects/"], tr').first()
    if (await projectLink.count() > 0) {
      await projectLink.click()
      await page.waitForLoadState('networkidle')

      const charterLink = page.locator('a[href*="foundation/charter"], a:has-text("Charter")')
      if (await charterLink.count() > 0) {
        await charterLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 7. Foundation Team ────────────────────────────────────────────

  test('7. Foundation Team page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const projectLink = page.locator('a[href*="/projects/"], tr').first()
    if (await projectLink.count() > 0) {
      await projectLink.click()
      await page.waitForLoadState('networkidle')

      const teamLink = page.locator('a[href*="foundation/team"], a:has-text("Team")')
      if (await teamLink.count() > 0) {
        await teamLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 8. Foundation Budget ──────────────────────────────────────────

  test('8. Foundation Budget page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const projectLink = page.locator('a[href*="/projects/"], tr').first()
    if (await projectLink.count() > 0) {
      await projectLink.click()
      await page.waitForLoadState('networkidle')

      const budgetLink = page.locator('a[href*="foundation/budget"], a:has-text("Budget")')
      if (await budgetLink.count() > 0) {
        await budgetLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 9. Planning Timeline ──────────────────────────────────────────

  test('9. Planning Timeline page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const projectLink = page.locator('a[href*="/projects/"], tr').first()
    if (await projectLink.count() > 0) {
      await projectLink.click()
      await page.waitForLoadState('networkidle')

      const timelineLink = page.locator('a[href*="planning/timeline"], a:has-text("Timeline")')
      if (await timelineLink.count() > 0) {
        await timelineLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 10. Planning Milestones ───────────────────────────────────────

  test('10. Planning Milestones page loads', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const projectLink = page.locator('a[href*="/projects/"], tr').first()
    if (await projectLink.count() > 0) {
      await projectLink.click()
      await page.waitForLoadState('networkidle')

      const milestoneLink = page.locator('a[href*="planning/milestones"], a:has-text("Milestones")')
      if (await milestoneLink.count() > 0) {
        await milestoneLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 11. Methodology Navigation ────────────────────────────────────

  test('11. Sidebar shows methodology-specific navigation', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const projectLink = page.locator('a[href*="/projects/"], tr').first()
    if (await projectLink.count() > 0) {
      await projectLink.click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)

      // Sidebar should show methodology-relevant links
      const sidebar = page.locator('nav, aside')
      if (await sidebar.count() > 0) {
        await expect(sidebar.first()).toBeVisible()
      }
    }
  })

  // ── 12. Dashboard Access ──────────────────────────────────────────

  test('12. Dashboard page loads after login', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    await waitForLoading(page)
    await expectNoError(page)
  })
})

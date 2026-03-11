/**
 * PROGRAM MANAGEMENT UAT Tests
 * Tests every Program Management feature page one by one.
 */
import { test, expect } from '@playwright/test'
import { login, waitForLoading, expectNoError } from '../helpers/test-utils'

test.describe('Program Management - Complete UAT', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  // ── 1. Programs List ──────────────────────────────────────────────

  test('1. Programs list page loads', async ({ page }) => {
    await page.goto('/programs')
    await page.waitForLoadState('networkidle')
    await waitForLoading(page)
    await expectNoError(page)
  })

  // ── 2. Create New Program ─────────────────────────────────────────

  test('2. Create Program dialog or page opens', async ({ page }) => {
    await page.goto('/programs')
    await page.waitForLoadState('networkidle')

    const createBtn = page.locator('button:has-text("New Program"), button:has-text("Create Program"), a:has-text("New Program")')
    if (await createBtn.count() > 0) {
      await createBtn.first().click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)
      await expectNoError(page)

      // Should see form fields or new program page
      const formContent = page.locator('text=/program name|title|methodology/i')
      if (await formContent.count() > 0) {
        await expect(formContent.first()).toBeVisible()
      }
    }
  })

  // ── 3. Program Detail / Overview ──────────────────────────────────

  test('3. Program Detail page loads', async ({ page }) => {
    await page.goto('/programs')
    await page.waitForLoadState('networkidle')

    // Click the first program link
    const programLink = page.locator('a[href*="/programs/"], tr').first()
    if (await programLink.count() > 0) {
      await programLink.click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)
      await expectNoError(page)
    }
  })

  // ── 4. Program Benefits ───────────────────────────────────────────

  test('4. Program Benefits page loads', async ({ page }) => {
    await page.goto('/programs')
    await page.waitForLoadState('networkidle')

    const programLink = page.locator('a[href*="/programs/"], tr').first()
    if (await programLink.count() > 0) {
      await programLink.click()
      await page.waitForLoadState('networkidle')

      const benefitsLink = page.locator('a[href*="benefits"], a:has-text("Benefits")')
      if (await benefitsLink.count() > 0) {
        await benefitsLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 5. Program Risks ──────────────────────────────────────────────

  test('5. Program Risks page loads', async ({ page }) => {
    await page.goto('/programs')
    await page.waitForLoadState('networkidle')

    const programLink = page.locator('a[href*="/programs/"], tr').first()
    if (await programLink.count() > 0) {
      await programLink.click()
      await page.waitForLoadState('networkidle')

      const risksLink = page.locator('a[href*="risks"], a:has-text("Risks")')
      if (await risksLink.count() > 0) {
        await risksLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 6. Program Milestones ─────────────────────────────────────────

  test('6. Program Milestones page loads', async ({ page }) => {
    await page.goto('/programs')
    await page.waitForLoadState('networkidle')

    const programLink = page.locator('a[href*="/programs/"], tr').first()
    if (await programLink.count() > 0) {
      await programLink.click()
      await page.waitForLoadState('networkidle')

      const milestoneLink = page.locator('a[href*="milestones"], a:has-text("Milestones")')
      if (await milestoneLink.count() > 0) {
        await milestoneLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 7. Program Budget ─────────────────────────────────────────────

  test('7. Program Budget page loads', async ({ page }) => {
    await page.goto('/programs')
    await page.waitForLoadState('networkidle')

    const programLink = page.locator('a[href*="/programs/"], tr').first()
    if (await programLink.count() > 0) {
      await programLink.click()
      await page.waitForLoadState('networkidle')

      const budgetLink = page.locator('a[href*="budget"], a:has-text("Budget")')
      if (await budgetLink.count() > 0) {
        await budgetLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 8. Program Governance ─────────────────────────────────────────

  test('8. Program Governance page loads', async ({ page }) => {
    await page.goto('/programs')
    await page.waitForLoadState('networkidle')

    const programLink = page.locator('a[href*="/programs/"], tr').first()
    if (await programLink.count() > 0) {
      await programLink.click()
      await page.waitForLoadState('networkidle')

      const govLink = page.locator('a[href*="governance"], a:has-text("Governance")')
      if (await govLink.count() > 0) {
        await govLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  // ── 9. Program Stakeholders ───────────────────────────────────────

  test('9. Program Stakeholders page loads', async ({ page }) => {
    await page.goto('/programs')
    await page.waitForLoadState('networkidle')

    const programLink = page.locator('a[href*="/programs/"], tr').first()
    if (await programLink.count() > 0) {
      await programLink.click()
      await page.waitForLoadState('networkidle')

      const stakeholderLink = page.locator('a[href*="stakeholder"], a:has-text("Stakeholder")')
      if (await stakeholderLink.count() > 0) {
        await stakeholderLink.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })
})

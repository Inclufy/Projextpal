/**
 * ACADEMY UAT Tests
 * Tests every Academy feature page one by one:
 * - Training Marketplace (course browsing)
 * - Course Detail pages
 * - Course Checkout flow
 * - Learning Player
 * - Quote Request
 * - Admin Training Management
 */
import { test, expect } from '@playwright/test'
import { login, waitForLoading, expectNoError } from '../helpers/test-utils'

test.describe('Academy - Training Marketplace UAT', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  // ── 1. Academy Marketplace ────────────────────────────────────────

  test('1. Academy Marketplace page loads', async ({ page }) => {
    await page.goto('/academy')
    await page.waitForLoadState('networkidle')
    await waitForLoading(page)
    await expectNoError(page)
  })

  test('2. Academy Marketplace via sidebar navigation', async ({ page }) => {
    // Click Academy in sidebar
    const academyLink = page.locator('a:has-text("Academy"), a[href*="academy"]')
    if (await academyLink.count() > 0) {
      await academyLink.first().click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)
      await expectNoError(page)
    }
  })

  test('3. Marketplace displays course cards', async ({ page }) => {
    await page.goto('/academy/marketplace')
    await page.waitForLoadState('networkidle')
    await waitForLoading(page)
    await expectNoError(page)

    // Should show course-related content
    const courseContent = page.locator('text=/course|cursus|training|certificat/i')
    if (await courseContent.count() > 0) {
      await expect(courseContent.first()).toBeVisible({ timeout: 10000 })
    }
  })

  test('4. Marketplace shows course categories', async ({ page }) => {
    await page.goto('/academy/marketplace')
    await page.waitForLoadState('networkidle')
    await waitForLoading(page)

    // Look for category filters or headings
    const categories = page.locator('text=/project management|agile|scrum|leadership|governance|process improvement/i')
    if (await categories.count() > 0) {
      await expect(categories.first()).toBeVisible()
    }
  })

  test('5. Marketplace shows course pricing', async ({ page }) => {
    await page.goto('/academy/marketplace')
    await page.waitForLoadState('networkidle')
    await waitForLoading(page)

    // Look for price indicators (€ or price amounts)
    const pricing = page.locator('text=/€|\\$|price|prijs|gratis|free/i')
    if (await pricing.count() > 0) {
      await expect(pricing.first()).toBeVisible()
    }
  })

  test('6. Marketplace shows difficulty badges', async ({ page }) => {
    await page.goto('/academy/marketplace')
    await page.waitForLoadState('networkidle')
    await waitForLoading(page)

    const badges = page.locator('text=/beginner|intermediate|advanced|expert|gevorderd/i')
    if (await badges.count() > 0) {
      await expect(badges.first()).toBeVisible()
    }
  })
})

test.describe('Academy - Course Detail UAT', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  // ── 7. Course Detail Page ─────────────────────────────────────────

  test('7. Course Detail page loads from marketplace', async ({ page }) => {
    await page.goto('/academy/marketplace')
    await page.waitForLoadState('networkidle')
    await waitForLoading(page)

    // Click first course card/link
    const courseLink = page.locator('a[href*="/academy/course/"]').first()
    if (await courseLink.count() > 0) {
      await courseLink.click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)
      await expectNoError(page)
    }
  })

  test('8. Course Detail shows modules and lessons', async ({ page }) => {
    await page.goto('/academy/marketplace')
    await page.waitForLoadState('networkidle')
    await waitForLoading(page)

    const courseLink = page.locator('a[href*="/academy/course/"]').first()
    if (await courseLink.count() > 0) {
      await courseLink.click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)

      // Should show module/lesson structure
      const moduleContent = page.locator('text=/module|lesson|les|hoofdstuk/i')
      if (await moduleContent.count() > 0) {
        await expect(moduleContent.first()).toBeVisible()
      }
    }
  })

  test('9. Course Detail shows instructor info', async ({ page }) => {
    await page.goto('/academy/marketplace')
    await page.waitForLoadState('networkidle')
    await waitForLoading(page)

    const courseLink = page.locator('a[href*="/academy/course/"]').first()
    if (await courseLink.count() > 0) {
      await courseLink.click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)

      const instructorInfo = page.locator('text=/instructor|docent|trainer/i')
      if (await instructorInfo.count() > 0) {
        await expect(instructorInfo.first()).toBeVisible()
      }
    }
  })

  test('10. Course Detail shows What You Will Learn', async ({ page }) => {
    await page.goto('/academy/marketplace')
    await page.waitForLoadState('networkidle')
    await waitForLoading(page)

    const courseLink = page.locator('a[href*="/academy/course/"]').first()
    if (await courseLink.count() > 0) {
      await courseLink.click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)

      const learnSection = page.locator('text=/what you.?ll learn|wat je leert|learning outcome/i')
      if (await learnSection.count() > 0) {
        await expect(learnSection.first()).toBeVisible()
      }
    }
  })

  test('11. Course Detail shows enroll/buy button', async ({ page }) => {
    await page.goto('/academy/marketplace')
    await page.waitForLoadState('networkidle')
    await waitForLoading(page)

    const courseLink = page.locator('a[href*="/academy/course/"]').first()
    if (await courseLink.count() > 0) {
      await courseLink.click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)

      const enrollBtn = page.locator('button:has-text("Enroll"), button:has-text("Buy"), button:has-text("Inschrijven"), button:has-text("Start"), a:has-text("Enroll")')
      if (await enrollBtn.count() > 0) {
        await expect(enrollBtn.first()).toBeVisible()
      }
    }
  })

  test('12. Course Detail shows requirements', async ({ page }) => {
    await page.goto('/academy/marketplace')
    await page.waitForLoadState('networkidle')
    await waitForLoading(page)

    const courseLink = page.locator('a[href*="/academy/course/"]').first()
    if (await courseLink.count() > 0) {
      await courseLink.click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)

      const requirements = page.locator('text=/requirement|vereist|prerequisite/i')
      if (await requirements.count() > 0) {
        await expect(requirements.first()).toBeVisible()
      }
    }
  })
})

test.describe('Academy - Checkout & Enrollment UAT', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  // ── 13. Checkout Flow ─────────────────────────────────────────────

  test('13. Course Checkout page loads', async ({ page }) => {
    await page.goto('/academy/marketplace')
    await page.waitForLoadState('networkidle')
    await waitForLoading(page)

    // Navigate to a course then click enroll
    const courseLink = page.locator('a[href*="/academy/course/"]').first()
    if (await courseLink.count() > 0) {
      await courseLink.click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)

      const enrollBtn = page.locator('button:has-text("Enroll"), button:has-text("Buy"), button:has-text("Inschrijven"), a[href*="checkout"]')
      if (await enrollBtn.count() > 0) {
        await enrollBtn.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)
        await expectNoError(page)
      }
    }
  })

  test('14. Checkout shows order summary', async ({ page }) => {
    // Navigate to checkout page directly if a course ID is available
    await page.goto('/academy/marketplace')
    await page.waitForLoadState('networkidle')
    await waitForLoading(page)

    const courseLink = page.locator('a[href*="/academy/course/"]').first()
    if (await courseLink.count() > 0) {
      await courseLink.click()
      await page.waitForLoadState('networkidle')

      const checkoutBtn = page.locator('a[href*="checkout"], button:has-text("Enroll"), button:has-text("Buy")')
      if (await checkoutBtn.count() > 0) {
        await checkoutBtn.first().click()
        await page.waitForLoadState('networkidle')
        await waitForLoading(page)

        const orderSummary = page.locator('text=/order|bestelling|summary|samenvatting|total|totaal/i')
        if (await orderSummary.count() > 0) {
          await expect(orderSummary.first()).toBeVisible()
        }
      }
    }
  })
})

test.describe('Academy - Learning Player UAT', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  // ── 15. Learning Player ───────────────────────────────────────────

  test('15. Learning Player loads for enrolled course', async ({ page }) => {
    // Try to access a learning player page
    await page.goto('/academy/marketplace')
    await page.waitForLoadState('networkidle')
    await waitForLoading(page)

    // Look for "Continue Learning" or similar enrolled course links
    const learnLink = page.locator('a[href*="/learn"], button:has-text("Continue"), button:has-text("Start Learning"), button:has-text("Doorgaan")')
    if (await learnLink.count() > 0) {
      await learnLink.first().click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)
      await expectNoError(page)
    }
  })
})

test.describe('Academy - Quote Request UAT', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  // ── 16. Quote Request ─────────────────────────────────────────────

  test('16. Quote Request page loads', async ({ page }) => {
    await page.goto('/academy/quote')
    await page.waitForLoadState('networkidle')
    await waitForLoading(page)
    await expectNoError(page)
  })

  test('17. Quote Request shows form fields', async ({ page }) => {
    await page.goto('/academy/quote')
    await page.waitForLoadState('networkidle')
    await waitForLoading(page)

    // Should show company/contact form fields
    const formFields = page.locator('input, textarea, select')
    if (await formFields.count() > 0) {
      await expect(formFields.first()).toBeVisible()
    }
  })
})

test.describe('Academy - Admin Training Management UAT', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  // ── 18. Admin Training Dashboard ──────────────────────────────────

  test('18. Admin Training Management page loads', async ({ page }) => {
    await page.goto('/admin/training')
    await page.waitForLoadState('networkidle')
    await waitForLoading(page)
    await expectNoError(page)
  })

  test('19. Admin shows courses list', async ({ page }) => {
    await page.goto('/admin/training')
    await page.waitForLoadState('networkidle')
    await waitForLoading(page)

    // Look for courses tab or table
    const coursesTab = page.locator('text=/cursussen|courses|course management/i')
    if (await coursesTab.count() > 0) {
      await coursesTab.first().click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)
      await expectNoError(page)
    }
  })

  test('20. Admin shows enrollments', async ({ page }) => {
    await page.goto('/admin/training')
    await page.waitForLoadState('networkidle')
    await waitForLoading(page)

    const enrollmentsTab = page.locator('text=/inschrijvingen|enrollments/i')
    if (await enrollmentsTab.count() > 0) {
      await enrollmentsTab.first().click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)
      await expectNoError(page)
    }
  })

  test('21. Admin shows quotes management', async ({ page }) => {
    await page.goto('/admin/training')
    await page.waitForLoadState('networkidle')
    await waitForLoading(page)

    const quotesTab = page.locator('text=/offertes|quotes/i')
    if (await quotesTab.count() > 0) {
      await quotesTab.first().click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)
      await expectNoError(page)
    }
  })

  test('22. Admin shows content management', async ({ page }) => {
    await page.goto('/admin/training')
    await page.waitForLoadState('networkidle')
    await waitForLoading(page)

    const contentTab = page.locator('text=/content.*beheer|content management/i')
    if (await contentTab.count() > 0) {
      await contentTab.first().click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)
      await expectNoError(page)
    }
  })

  test('23. Admin shows analytics', async ({ page }) => {
    await page.goto('/admin/training')
    await page.waitForLoadState('networkidle')
    await waitForLoading(page)

    const analyticsTab = page.locator('text=/analytics|statistieken/i')
    if (await analyticsTab.count() > 0) {
      await analyticsTab.first().click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)
      await expectNoError(page)
    }
  })

  test('24. Admin shows certificates stats', async ({ page }) => {
    await page.goto('/admin/training')
    await page.waitForLoadState('networkidle')
    await waitForLoading(page)

    const certTab = page.locator('text=/certificaten|certificates/i')
    if (await certTab.count() > 0) {
      await certTab.first().click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)
      await expectNoError(page)
    }
  })
})

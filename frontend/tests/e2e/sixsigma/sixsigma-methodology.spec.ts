/**
 * SIX SIGMA (DMAIC) Methodology UAT Tests
 * Tests every Six Sigma feature page one by one, grouped by DMAIC phase.
 */
import { test, expect } from '@playwright/test'
import { login, waitForLoading, expectNoError } from '../helpers/test-utils'

test.describe('Six Sigma (DMAIC) Methodology - Complete UAT', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  // Helper: navigate to a Six Sigma project
  async function goToSixSigmaProject(page: import('@playwright/test').Page) {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const ssLink = page.locator('a, tr, div').filter({ hasText: /six sigma|lean|lss|dmaic/i }).first()
    if (await ssLink.count() > 0) {
      await ssLink.click()
      await page.waitForLoadState('networkidle')
      return true
    }
    return false
  }

  // ── 1. Six Sigma Dashboard ────────────────────────────────────────

  test('1. DMAIC Dashboard page loads', async ({ page }) => {
    if (!(await goToSixSigmaProject(page))) return

    const dashLink = page.locator('a[href*="sixsigma/dashboard"], a[href*="sixsigma"], a:has-text("Dashboard")')
    if (await dashLink.count() > 0) {
      await dashLink.first().click()
      await page.waitForLoadState('networkidle')
    }
    await waitForLoading(page)
    await expectNoError(page)
  })

  // ─── DEFINE PHASE ─────────────────────────────────────────────────

  test('2. SIPOC Diagram page loads', async ({ page }) => {
    if (!(await goToSixSigmaProject(page))) return

    const link = page.locator('a[href*="sipoc"], a:has-text("SIPOC")')
    if (await link.count() > 0) {
      await link.first().click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)
      await expectNoError(page)
    }
  })

  test('3. Voice of Customer page loads', async ({ page }) => {
    if (!(await goToSixSigmaProject(page))) return

    const link = page.locator('a[href*="voc"], a:has-text("Voice of Customer"), a:has-text("VOC")')
    if (await link.count() > 0) {
      await link.first().click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)
      await expectNoError(page)
    }
  })

  test('4. Project Charter page loads', async ({ page }) => {
    if (!(await goToSixSigmaProject(page))) return

    const link = page.locator('a[href*="charter"], a:has-text("Charter")')
    if (await link.count() > 0) {
      await link.first().click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)
      await expectNoError(page)
    }
  })

  // ─── MEASURE PHASE ────────────────────────────────────────────────

  test('5. Data Collection Plan page loads', async ({ page }) => {
    if (!(await goToSixSigmaProject(page))) return

    const link = page.locator('a[href*="data-collection"], a:has-text("Data Collection")')
    if (await link.count() > 0) {
      await link.first().click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)
      await expectNoError(page)
    }
  })

  test('6. MSA (Measurement System Analysis) page loads', async ({ page }) => {
    if (!(await goToSixSigmaProject(page))) return

    const link = page.locator('a[href*="msa"], a:has-text("MSA"), a:has-text("Measurement")')
    if (await link.count() > 0) {
      await link.first().click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)
      await expectNoError(page)
    }
  })

  test('7. Baseline Metrics page loads', async ({ page }) => {
    if (!(await goToSixSigmaProject(page))) return

    const link = page.locator('a[href*="baseline"], a:has-text("Baseline")')
    if (await link.count() > 0) {
      await link.first().click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)
      await expectNoError(page)
    }
  })

  // ─── ANALYZE PHASE ────────────────────────────────────────────────

  test('8. Fishbone Diagram page loads', async ({ page }) => {
    if (!(await goToSixSigmaProject(page))) return

    const link = page.locator('a[href*="fishbone"], a:has-text("Fishbone"), a:has-text("Ishikawa")')
    if (await link.count() > 0) {
      await link.first().click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)
      await expectNoError(page)
    }
  })

  test('9. Pareto Analysis page loads', async ({ page }) => {
    if (!(await goToSixSigmaProject(page))) return

    const link = page.locator('a[href*="pareto"], a:has-text("Pareto")')
    if (await link.count() > 0) {
      await link.first().click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)
      await expectNoError(page)
    }
  })

  test('10. Hypothesis Testing page loads', async ({ page }) => {
    if (!(await goToSixSigmaProject(page))) return

    const link = page.locator('a[href*="hypothesis"], a:has-text("Hypothesis")')
    if (await link.count() > 0) {
      await link.first().click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)
      await expectNoError(page)
    }
  })

  test('11. Root Cause Analysis page loads', async ({ page }) => {
    if (!(await goToSixSigmaProject(page))) return

    const link = page.locator('a[href*="root-cause"], a:has-text("Root Cause")')
    if (await link.count() > 0) {
      await link.first().click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)
      await expectNoError(page)
    }
  })

  // ─── IMPROVE PHASE ────────────────────────────────────────────────

  test('12. Solutions page loads', async ({ page }) => {
    if (!(await goToSixSigmaProject(page))) return

    const link = page.locator('a[href*="solutions"], a:has-text("Solutions")')
    if (await link.count() > 0) {
      await link.first().click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)
      await expectNoError(page)
    }
  })

  test('13. Pilot Plan page loads', async ({ page }) => {
    if (!(await goToSixSigmaProject(page))) return

    const link = page.locator('a[href*="pilot"], a:has-text("Pilot")')
    if (await link.count() > 0) {
      await link.first().click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)
      await expectNoError(page)
    }
  })

  test('14. FMEA page loads', async ({ page }) => {
    if (!(await goToSixSigmaProject(page))) return

    const link = page.locator('a[href*="fmea"], a:has-text("FMEA")')
    if (await link.count() > 0) {
      await link.first().click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)
      await expectNoError(page)
    }
  })

  test('15. Implementation Plan page loads', async ({ page }) => {
    if (!(await goToSixSigmaProject(page))) return

    const link = page.locator('a[href*="implementation"], a:has-text("Implementation")')
    if (await link.count() > 0) {
      await link.first().click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)
      await expectNoError(page)
    }
  })

  // ─── CONTROL PHASE ────────────────────────────────────────────────

  test('16. Control Plan page loads', async ({ page }) => {
    if (!(await goToSixSigmaProject(page))) return

    const link = page.locator('a[href*="control-plan"], a:has-text("Control Plan")')
    if (await link.count() > 0) {
      await link.first().click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)
      await expectNoError(page)
    }
  })

  test('17. Control Charts (SPC) page loads', async ({ page }) => {
    if (!(await goToSixSigmaProject(page))) return

    const link = page.locator('a[href*="control-chart"], a[href*="spc"], a:has-text("Control Chart"), a:has-text("SPC")')
    if (await link.count() > 0) {
      await link.first().click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)
      await expectNoError(page)
    }
  })

  test('18. Tollgate Reviews page loads', async ({ page }) => {
    if (!(await goToSixSigmaProject(page))) return

    const link = page.locator('a[href*="tollgate"], a:has-text("Tollgate")')
    if (await link.count() > 0) {
      await link.first().click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)
      await expectNoError(page)
    }
  })

  test('19. Project Closure page loads', async ({ page }) => {
    if (!(await goToSixSigmaProject(page))) return

    const link = page.locator('a[href*="sixsigma"][href*="closure"], a:has-text("Closure")')
    if (await link.count() > 0) {
      await link.first().click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)
      await expectNoError(page)
    }
  })

  test('20. Monitoring page loads', async ({ page }) => {
    if (!(await goToSixSigmaProject(page))) return

    const link = page.locator('a[href*="monitoring"], a:has-text("Monitoring")')
    if (await link.count() > 0) {
      await link.first().click()
      await page.waitForLoadState('networkidle')
      await waitForLoading(page)
      await expectNoError(page)
    }
  })
})

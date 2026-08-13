import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@tests/helpers/render'
import { MethodologyOnboardingWizard } from '@/components/MethodologyOnboardingWizard'

const noop = () => {}

const renderWizard = (methodology: string) =>
  render(
    <MethodologyOnboardingWizard
      methodology={methodology}
      projectName="Test Programme"
      open={true}
      onClose={noop}
      onComplete={noop}
    />
  )

describe('MethodologyOnboardingWizard', () => {
  it('shows Inclufy Best Practice branding for methodology "inclufy" (not Hybrid)', () => {
    renderWizard('inclufy')

    expect(
      screen.getByText(/Welcome to Inclufy Best Practice/i)
    ).toBeInTheDocument()
    expect(screen.queryByText(/Welcome to Hybrid/i)).not.toBeInTheDocument()
  })

  it('still shows Hybrid branding for methodology "hybrid"', () => {
    renderWizard('hybrid')

    expect(screen.getByText(/Welcome to Hybrid/i)).toBeInTheDocument()
  })

  it('falls back to Hybrid for an unknown methodology', () => {
    renderWizard('does_not_exist')

    expect(screen.getByText(/Welcome to Hybrid/i)).toBeInTheDocument()
  })

  it('shows SAFe branding for methodology "safe"', () => {
    renderWizard('safe')

    expect(screen.getByText(/Welcome to SAFe/i)).toBeInTheDocument()
  })
})

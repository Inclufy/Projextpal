import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ProgramDetail from '@/pages/ProgramDetail'

vi.mock('@/components/DemoControls', () => ({
  DemoControls: () => null,
}))

const mockProgram = (methodology: string) => ({
  id: 80,
  name: 'Digital Transformation 2026',
  description: 'Test programme',
  methodology,
  status: 'active',
  health_status: 'green',
  total_budget: '500000',
  currency: 'EUR',
  project_count: 0,
})

const mockFetch = (methodology: string) =>
  vi.fn().mockImplementation((url: string) => {
    const body = String(url).match(/\/api\/v1\/programs\/\d+\/$/)
      ? mockProgram(methodology)
      : []
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(body),
    })
  })

const renderDetail = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/programs/80']}>
        <Routes>
          <Route path="/programs/:id" element={<ProgramDetail />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('ProgramDetail methodology badge', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('shows "Best Practice" badge for an inclufy programme (not Hybrid)', async () => {
    global.fetch = mockFetch('inclufy') as unknown as typeof fetch
    renderDetail()

    expect(
      await screen.findByText('Digital Transformation 2026')
    ).toBeInTheDocument()
    expect(screen.getByText('Best Practice')).toBeInTheDocument()
    expect(screen.queryByText('Hybrid')).not.toBeInTheDocument()
  })

  it('still shows "Hybrid" badge for a hybrid programme', async () => {
    global.fetch = mockFetch('hybrid') as unknown as typeof fetch
    renderDetail()

    expect(
      await screen.findByText('Digital Transformation 2026')
    ).toBeInTheDocument()
    expect(screen.getByText('Hybrid')).toBeInTheDocument()
  })

  it('falls back to "Hybrid" badge for an unknown methodology', async () => {
    global.fetch = mockFetch('mystery_method') as unknown as typeof fetch
    renderDetail()

    expect(
      await screen.findByText('Digital Transformation 2026')
    ).toBeInTheDocument()
    expect(screen.getByText('Hybrid')).toBeInTheDocument()
  })
})

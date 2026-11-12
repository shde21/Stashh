import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext, type AuthContextValue } from '../auth/auth.context'
import DashboardPage from './DashboardPage'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function stubInvestorDashboardFetches() {
  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/api/v1/investor/fundraising/pools')) {
        return Promise.resolve(
          new Response(
            JSON.stringify([
              {
                id: 1,
                profileId: 10,
                companyName: 'Vayu Grid',
                tagline: 'Smart microgrids',
                sector: 'CleanTech',
                stage: 'EARLY_REVENUE',
                title: 'Seed Round',
                targetAmount: 10_000_000,
                minCommitment: 100_000,
                maxCommitment: 2_000_000,
                valuationCap: 80_000_000,
                pricePerShare: 500,
                totalSharesOffered: 20_000,
                sharesRemaining: 12_000,
                sharesAllocated: 8_000,
                roundValuationBasis: 80_000_000,
                currency: 'INR',
                status: 'OPEN',
                opensAt: null,
                endsAt: null,
                totalCommitted: 4_000_000,
                commitmentCount: 6,
                viewerCommitment: null,
                viewerSharesAllocated: null,
              },
            ]),
            { status: 200 },
          ),
        )
      }
      if (url.includes('/api/v1/investor/marketplace/watchlist')) {
        return Promise.resolve(new Response(JSON.stringify([{ profileId: 10 }]), { status: 200 }))
      }
      if (url.includes('/api/v1/investor/marketplace/interests')) {
        return Promise.resolve(new Response(JSON.stringify([{ id: 1, status: 'PENDING' }]), { status: 200 }))
      }
      if (url.includes('/api/v1/investor/portfolio')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              totalCommitted: 500_000,
              valuedAmount: 650_000,
              illustrativeGain: 150_000,
              activeHoldingsCount: 1,
              positions: [
                {
                  commitmentId: 1,
                  poolId: 1,
                  profileId: 10,
                  companyName: 'Vayu Grid',
                  poolTitle: 'Seed Round',
                  status: 'ACTIVE',
                  amount: 500_000,
                  shares: 1000,
                  acquisitionPricePerShare: 500,
                  latestSharePrice: 650,
                  currentValue: 650_000,
                  illustrativeGain: 150_000,
                  gainPercentage: 30,
                  ownershipPercentage: 1.5,
                  currency: 'INR',
                  valuationCap: 80_000_000,
                  latestValuation: 95_000_000,
                  valuationAt: '2026-11-01T00:00:00Z',
                },
              ],
            }),
            { status: 200 },
          ),
        )
      }
      return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }))
    }),
  )
}

function renderInvestorOverview() {
  const authValue: AuthContextValue = {
    state: {
      status: 'authenticated',
      user: { id: 1, email: 'investor1@trial.com', role: 'INVESTOR' },
      error: null,
    },
    user: { id: 1, email: 'investor1@trial.com', role: 'INVESTOR' },
    isAuthenticated: true,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    withCsrf: vi.fn(),
    refreshSession: vi.fn(),
  }

  return render(
    <MemoryRouter initialEntries={['/app/investor']}>
      <AuthContext.Provider value={authValue}>
        <DashboardPage role="INVESTOR" section="overview" />
      </AuthContext.Provider>
    </MemoryRouter>,
  )
}

describe('DashboardPage', () => {
  it('renders live investor analytics charts and editorial feature descriptions without extra link buttons', async () => {
    stubInvestorDashboardFetches()
    renderInvestorOverview()

    expect(await screen.findByRole('progressbar', { name: 'Vayu Grid funding progress' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Portfolio Allocation & Value' })).toBeInTheDocument()

    expect(screen.getByRole('heading', { level: 3, name: 'Discover vetted startups' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Saved watchlist' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Direct introductions' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Portfolio & valuations' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Open watchlist' })).not.toBeInTheDocument()
  })
})

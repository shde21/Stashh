import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthProvider'
import InvestorWatchlistPage from './InvestorWatchlistPage'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const sampleWatchlist = [
  {
    profileId: 101,
    companyName: 'Signal Works',
    tagline: 'Data products for overlooked markets',
    sector: 'Data products',
    stage: 'PRE_REVENUE',
    note: 'Strong founder background',
    savedAt: '2026-10-24T12:00:00Z',
  },
]

const sampleInterests = [
  {
    id: 5,
    profileId: 101,
    companyName: 'Signal Works',
    investorEmail: 'investor@example.com',
    message: 'Looking forward to the demo.',
    status: 'PENDING',
    createdAt: '2026-10-24T12:30:00Z',
    updatedAt: '2026-10-24T12:30:00Z',
  },
]

function renderWatchlist() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <InvestorWatchlistPage />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('InvestorWatchlistPage', () => {
  it('renders saved startups with thesis notes and interest requests', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/v1/auth/csrf')) {
        return Promise.resolve(new Response(JSON.stringify({ token: 'csrf-token' }), { status: 200 }))
      }
      if (url.includes('/api/v1/me')) {
        return Promise.resolve(new Response(JSON.stringify({ id: 2, email: 'investor@example.com', role: 'INVESTOR' }), { status: 200 }))
      }
      if (url.includes('/api/v1/investor/marketplace/watchlist')) {
        return Promise.resolve(new Response(JSON.stringify(sampleWatchlist), { status: 200 }))
      }
      if (url.includes('/api/v1/investor/marketplace/interests')) {
        return Promise.resolve(new Response(JSON.stringify(sampleInterests), { status: 200 }))
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`))
    })
    vi.stubGlobal('fetch', fetchMock)

    renderWatchlist()

    const titles = await screen.findAllByText('Signal Works')
    expect(titles.length).toBeGreaterThan(0)
    expect(screen.getByDisplayValue('Strong founder background')).toBeInTheDocument()
    expect(screen.getByText('Looking forward to the demo.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save thesis note/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /withdraw introduction/i })).toBeInTheDocument()
  })

  it('updates a thesis note and sends CSRF token', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string, opts?: RequestInit) => {
      if (url.includes('/api/v1/auth/csrf')) {
        return Promise.resolve(new Response(JSON.stringify({ token: 'test-csrf-123' }), { status: 200 }))
      }
      if (url.includes('/api/v1/me')) {
        return Promise.resolve(new Response(JSON.stringify({ id: 2, email: 'investor@example.com', role: 'INVESTOR' }), { status: 200 }))
      }
      if (url.includes('/api/v1/investor/marketplace/watchlist/101') && opts?.method === 'PUT') {
        return Promise.resolve(new Response('', { status: 200 }))
      }
      if (url.includes('/api/v1/investor/marketplace/watchlist')) {
        return Promise.resolve(new Response(JSON.stringify(sampleWatchlist), { status: 200 }))
      }
      if (url.includes('/api/v1/investor/marketplace/interests')) {
        return Promise.resolve(new Response(JSON.stringify(sampleInterests), { status: 200 }))
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`))
    })
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()

    renderWatchlist()

    const noteInput = await screen.findByDisplayValue('Strong founder background')
    await user.clear(noteInput)
    await user.type(noteInput, 'Higher conviction after reviewing pilot customers')
    await user.click(screen.getByRole('button', { name: /save thesis note/i }))

    expect(await screen.findByText('Thesis note updated.')).toBeInTheDocument()
    const putCall = fetchMock.mock.calls.find((call) => call[0].includes('/api/v1/investor/marketplace/watchlist/101'))
    expect(putCall).toBeDefined()
    expect(putCall![1].method).toBe('PUT')
    const headers = putCall![1].headers as Headers
    expect(headers.get('X-CSRF-Token')).toBe('test-csrf-123')
    expect(JSON.parse(putCall![1].body as string)).toEqual({ note: 'Higher conviction after reviewing pilot customers' })
  })

  it('withdraws an introduction request with CSRF protection', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string, opts?: RequestInit) => {
      if (url.includes('/api/v1/auth/csrf')) {
        return Promise.resolve(new Response(JSON.stringify({ token: 'test-csrf-123' }), { status: 200 }))
      }
      if (url.includes('/api/v1/me')) {
        return Promise.resolve(new Response(JSON.stringify({ id: 2, email: 'investor@example.com', role: 'INVESTOR' }), { status: 200 }))
      }
      if (url.includes('/api/v1/investor/marketplace/startups/101/interest') && opts?.method === 'DELETE') {
        return Promise.resolve(new Response(JSON.stringify({ ...sampleInterests[0], status: 'WITHDRAWN' }), { status: 200 }))
      }
      if (url.includes('/api/v1/investor/marketplace/watchlist')) {
        return Promise.resolve(new Response(JSON.stringify(sampleWatchlist), { status: 200 }))
      }
      if (url.includes('/api/v1/investor/marketplace/interests')) {
        return Promise.resolve(new Response(JSON.stringify(sampleInterests), { status: 200 }))
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`))
    })
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()

    renderWatchlist()

    const withdrawBtn = await screen.findByRole('button', { name: /withdraw introduction/i })
    await user.click(withdrawBtn)

    expect(await screen.findByText('Interest request withdrawn.')).toBeInTheDocument()
    const deleteCall = fetchMock.mock.calls.find((call) => call[0].includes('/api/v1/investor/marketplace/startups/101/interest'))
    expect(deleteCall).toBeDefined()
    expect(deleteCall![1].method).toBe('DELETE')
    const headers = deleteCall![1].headers as Headers
    expect(headers.get('X-CSRF-Token')).toBe('test-csrf-123')
  })
})

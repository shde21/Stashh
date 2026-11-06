import { apiRequest } from '../lib/api'
import type { StartupStage } from '../startup/startup.types'
import type { FundraisingPool, FundraisingPoolInput, InvestorCommitment, PoolStatus } from './fundraising.types'

export function fetchStartupPool(): Promise<FundraisingPool | undefined> {
  return apiRequest<FundraisingPool | undefined>('/api/v1/startup/fundraising/pool')
}

export function saveStartupPool(input: FundraisingPoolInput, csrfToken: string): Promise<FundraisingPool> {
  return apiRequest<FundraisingPool>('/api/v1/startup/fundraising/pool', {
    method: 'PUT',
    body: JSON.stringify(input),
    csrfToken,
  })
}

export function setStartupPoolStatus(status: Extract<PoolStatus, 'OPEN' | 'CLOSED'>, csrfToken: string): Promise<FundraisingPool> {
  return apiRequest<FundraisingPool>(`/api/v1/startup/fundraising/pool/${status === 'OPEN' ? 'open' : 'close'}`, {
    method: 'POST',
    csrfToken,
  })
}

export function fetchInvestorPools(filters: { sector?: string; stage?: StartupStage | ''; query?: string } = {}): Promise<FundraisingPool[]> {
  const params = new URLSearchParams()
  if (filters.sector) params.set('sector', filters.sector)
  if (filters.stage) params.set('stage', filters.stage)
  if (filters.query) params.set('q', filters.query)
  const suffix = params.toString() ? `?${params.toString()}` : ''
  return apiRequest<FundraisingPool[]>(`/api/v1/investor/fundraising/pools${suffix}`)
}

export function commitToPool(poolId: number, commitment: number | { amount?: number; shares?: number }, csrfToken: string): Promise<InvestorCommitment> {
  const body = typeof commitment === 'number' ? { amount: commitment } : commitment
  return apiRequest<InvestorCommitment>(`/api/v1/investor/fundraising/pools/${poolId}/commit`, {
    method: 'POST',
    body: JSON.stringify(body),
    csrfToken,
  })
}

export function fetchInvestorCommitments(): Promise<InvestorCommitment[]> {
  return apiRequest<InvestorCommitment[]>('/api/v1/investor/fundraising/commitments')
}

export function cancelInvestorCommitment(commitmentId: number, csrfToken: string): Promise<void> {
  return apiRequest<void>(`/api/v1/investor/fundraising/commitments/${commitmentId}`, {
    method: 'DELETE',
    csrfToken,
  })
}

export function fetchAdminPools(): Promise<FundraisingPool[]> {
  return apiRequest<FundraisingPool[]>('/api/v1/admin/fundraising/pools')
}

export function setAdminPoolStatus(poolId: number, status: Extract<PoolStatus, 'OPEN' | 'CLOSED'>, csrfToken: string): Promise<FundraisingPool> {
  return apiRequest<FundraisingPool>(`/api/v1/admin/fundraising/pools/${poolId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
    csrfToken,
  })
}

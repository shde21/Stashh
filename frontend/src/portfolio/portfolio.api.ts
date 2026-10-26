import { apiRequest } from '../lib/api'
import type { PortfolioSummary, ValuationSnapshot, ValuationSnapshotInput } from './portfolio.types'

export function fetchInvestorPortfolio(): Promise<PortfolioSummary> {
  return apiRequest<PortfolioSummary>('/api/v1/investor/portfolio')
}

export function fetchValuationSnapshots(): Promise<ValuationSnapshot[]> {
  return apiRequest<ValuationSnapshot[]>('/api/v1/admin/valuations')
}

export function createValuationSnapshot(input: ValuationSnapshotInput, csrfToken: string): Promise<ValuationSnapshot> {
  return apiRequest<ValuationSnapshot>('/api/v1/admin/valuations', {
    method: 'POST',
    body: JSON.stringify({
      ...input,
      snapshotAt: new Date(input.snapshotAt).toISOString(),
    }),
    csrfToken,
  })
}

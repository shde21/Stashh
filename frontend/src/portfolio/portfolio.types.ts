import type { CommitmentStatus } from '../fundraising/fundraising.types'

export type PortfolioPosition = {
  commitmentId: number
  poolId: number
  companyName: string
  poolTitle: string
  status: CommitmentStatus
  amount: number
  quants: number
  currency: string
  valuationCap: number | null
  latestValuation: number | null
  valuationAt: string | null
  currentValue: number | null
  illustrativeGain: number | null
}

export type PortfolioSummary = {
  totalCommitted: number
  totalQuants: number
  valuedAmount: number
  illustrativeGain: number
  positions: PortfolioPosition[]
}

export type ValuationSnapshot = {
  id: number
  profileId: number
  companyName: string
  valuationAmount: number
  snapshotAt: string
  note: string | null
  createdAt: string
}

export type ValuationSnapshotInput = {
  profileId: number | null
  valuationAmount: number | null
  snapshotAt: string
  note: string
}

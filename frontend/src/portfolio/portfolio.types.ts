import type { CommitmentStatus } from '../fundraising/fundraising.types'

export type PortfolioPosition = {
  commitmentId: number
  poolId: number
  profileId: number
  companyName: string
  poolTitle: string
  status: CommitmentStatus
  amount: number
  shares: number
  acquisitionPricePerShare: number
  latestSharePrice: number | null
  currentValue: number | null
  illustrativeGain: number | null
  gainPercentage: number | null
  ownershipPercentage: number | null
  currency: string
  valuationCap: number | null
  latestValuation: number | null
  valuationAt: string | null
}

export type PortfolioSummary = {
  totalCommitted: number
  valuedAmount: number
  illustrativeGain: number
  activeHoldingsCount: number
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

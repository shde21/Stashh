import type { StartupStage } from '../startup/startup.types'

export type PoolStatus = 'DRAFT' | 'OPEN' | 'CLOSED'
export type CommitmentStatus = 'ACTIVE' | 'CANCELLED'

export type FundraisingPool = {
  id: number
  profileId: number
  companyName: string
  tagline: string | null
  sector: string | null
  stage: StartupStage
  title: string
  targetAmount: number
  minCommitment: number
  maxCommitment: number | null
  valuationCap: number | null
  pricePerShare: number
  totalSharesOffered: number
  sharesRemaining: number
  sharesAllocated: number
  roundValuationBasis: number | null
  currency: string
  status: PoolStatus
  opensAt: string | null
  endsAt: string | null
  totalCommitted: number
  commitmentCount: number
  viewerCommitment: number | null
  viewerSharesAllocated: number | null
}

export type FundraisingPoolInput = {
  title: string
  targetAmount: number | null
  minCommitment: number | null
  maxCommitment: number | null
  valuationCap: number | null
  pricePerShare?: number | null
  totalSharesOffered?: number | null
  roundValuationBasis?: number | null
  endsAt: string | null
}

export type InvestorCommitment = {
  id: number
  poolId: number
  companyName: string
  poolTitle: string
  amount: number
  sharesAllocated: number
  pricePerShare: number
  status: CommitmentStatus
  createdAt: string
  updatedAt: string
}

export type CommitmentInput = {
  amount?: number
  shares?: number
}

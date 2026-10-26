import type { StartupStage } from '../startup/startup.types'

export type MarketplaceStartup = {
  profileId: number
  companyName: string
  tagline: string | null
  sector: string | null
  stage: StartupStage
  note: string | null
  savedAt: string
}

export type InterestResponse = {
  id: number
  profileId: number
  companyName: string
  investorEmail: string
  message: string | null
  status: 'PENDING' | 'WITHDRAWN'
  createdAt: string
  updatedAt: string
}

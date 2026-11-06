export type StartupStage = 'PRE_REVENUE' | 'EARLY_REVENUE' | 'GROWTH'
export type ReviewStatus = 'DRAFT' | 'SUBMITTED' | 'CHANGES_REQUESTED' | 'APPROVED' | 'REJECTED'
export type StartupVisibility = 'PRIVATE' | 'PUBLIC'
export type DocumentKind = 'PITCH_DECK' | 'FINANCIALS' | 'OTHER'

export type StartupDocument = {
  id: number
  kind: DocumentKind
  title: string
  resourceUrl: string
  createdAt: string
}

export type CompanyCapitalization = {
  id: number
  profileId: number
  authorizedShares: number
  issuedShares: number
  outstandingShares: number
  treasuryShares: number
  reservedShares: number
  shareClass: string
  parValue: number
  unissuedShares: number
  fullyDilutedShares: number
  updatedAt: string
}

export type CompanyCapitalizationInput = {
  authorizedShares?: number
  issuedShares?: number
  outstandingShares?: number
  treasuryShares?: number
  reservedShares?: number
  shareClass?: string
  parValue?: number
}

export type StartupProfile = {
  id: number
  userId: number
  companyName: string
  tagline: string | null
  description: string | null
  website: string | null
  sector: string | null
  headquarters: string | null
  foundedYear: number | null
  stage: StartupStage
  teamSize: number | null
  pitchUrl: string | null
  reviewStatus: ReviewStatus
  visibility: StartupVisibility
  reviewNote: string | null
  submittedAt: string | null
  reviewedAt: string | null
  updatedAt: string
  metrics: Record<string, number>
  documents: StartupDocument[]
  capitalization: CompanyCapitalization | null
}

export type StartupProfileInput = {
  companyName: string
  tagline: string
  description: string
  website: string
  sector: string
  headquarters: string
  foundedYear: number | null
  stage: StartupStage
  teamSize: number | null
  pitchUrl: string
  metrics: Record<string, number>
}

export type DocumentInput = {
  kind: DocumentKind
  title: string
  resourceUrl: string
}

export type ReviewAction = 'CHANGES_REQUESTED' | 'APPROVED' | 'REJECTED'

import { apiRequest } from '../lib/api'
import type { InterestResponse, MarketplaceStartup } from './marketplace.types'

export function fetchWatchlist(): Promise<MarketplaceStartup[]> {
  return apiRequest<MarketplaceStartup[]>('/api/v1/investor/marketplace/watchlist')
}

export function saveToWatchlist(profileId: number, note: string, csrfToken: string): Promise<void> {
  return apiRequest<void>(`/api/v1/investor/marketplace/watchlist/${profileId}`, {
    method: 'PUT',
    body: JSON.stringify({ note }),
    csrfToken,
  })
}

export function removeFromWatchlist(profileId: number, csrfToken: string): Promise<void> {
  return apiRequest<void>(`/api/v1/investor/marketplace/watchlist/${profileId}`, {
    method: 'DELETE',
    csrfToken,
  })
}

export function expressInterest(profileId: number, message: string, csrfToken: string): Promise<InterestResponse> {
  return apiRequest<InterestResponse>(`/api/v1/investor/marketplace/startups/${profileId}/interest`, {
    method: 'POST',
    body: JSON.stringify({ message }),
    csrfToken,
  })
}

export function withdrawInterest(profileId: number, csrfToken: string): Promise<InterestResponse> {
  return apiRequest<InterestResponse>(`/api/v1/investor/marketplace/startups/${profileId}/interest`, {
    method: 'DELETE',
    csrfToken,
  })
}

export function fetchInvestorInterests(): Promise<InterestResponse[]> {
  return apiRequest<InterestResponse[]>('/api/v1/investor/marketplace/interests')
}

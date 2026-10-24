import { apiRequest } from '../lib/api'
import type { DocumentInput, StartupProfile, StartupProfileInput, ReviewAction, StartupVisibility } from './startup.types'

export function fetchStartupProfile(): Promise<StartupProfile | undefined> {
  return apiRequest<StartupProfile | undefined>('/api/v1/startup/profile')
}

export function saveStartupProfile(input: StartupProfileInput, csrfToken: string): Promise<StartupProfile> {
  return apiRequest<StartupProfile>('/api/v1/startup/profile', {
    method: 'PUT',
    body: JSON.stringify(input),
    csrfToken,
  })
}

export function submitStartupProfile(csrfToken: string): Promise<StartupProfile> {
  return apiRequest<StartupProfile>('/api/v1/startup/profile/submit', {
    method: 'POST',
    csrfToken,
  })
}

export function addStartupDocument(input: DocumentInput, csrfToken: string) {
  return apiRequest<StartupProfile['documents'][number]>('/api/v1/startup/documents', {
    method: 'POST',
    body: JSON.stringify(input),
    csrfToken,
  })
}

export function deleteStartupDocument(documentId: number, csrfToken: string): Promise<void> {
  return apiRequest<void>(`/api/v1/startup/documents/${documentId}`, {
    method: 'DELETE',
    csrfToken,
  })
}

export function fetchReviewQueue(): Promise<StartupProfile[]> {
  return apiRequest<StartupProfile[]>('/api/v1/admin/startups')
}

export function reviewStartup(profileId: number, action: ReviewAction, note: string, csrfToken: string): Promise<StartupProfile> {
  return apiRequest<StartupProfile>(`/api/v1/admin/startups/${profileId}/review`, {
    method: 'PATCH',
    body: JSON.stringify({ action, note }),
    csrfToken,
  })
}

export function setStartupVisibility(profileId: number, visibility: StartupVisibility, csrfToken: string): Promise<StartupProfile> {
  return apiRequest<StartupProfile>(`/api/v1/admin/startups/${profileId}/visibility`, {
    method: 'PATCH',
    body: JSON.stringify({ visibility }),
    csrfToken,
  })
}

export function fetchPublicStartups(): Promise<StartupProfile[]> {
  return apiRequest<StartupProfile[]>('/api/v1/investor/startups')
}

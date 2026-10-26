import { apiRequest } from '../lib/api'
import type { InterestResponse } from './marketplace.types'

export function fetchStartupInterests(): Promise<InterestResponse[]> {
  return apiRequest<InterestResponse[]>('/api/v1/startup/marketplace/interests')
}

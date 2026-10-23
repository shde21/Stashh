export type PlatformStatus = {
  service: string
  stage: string
  database: string
  migrationVersion: string
  checkedAt: string
}

export type ApiErrorBody = {
  code?: string
  message?: string
  fieldErrors?: Record<string, string>
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fieldErrors: Record<string, string>

  constructor(status: number, body: ApiErrorBody = {}) {
    super(body.message ?? `Request failed with HTTP ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.code = body.code ?? 'REQUEST_FAILED'
    this.fieldErrors = body.fieldErrors ?? {}
  }
}

export type ApiRequestOptions = RequestInit & {
  csrfToken?: string
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080').replace(/\/$/, '')

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { csrfToken, ...requestInit } = options
  const headers = new Headers(requestInit.headers)
  headers.set('Accept', 'application/json')
  if (requestInit.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (csrfToken) {
    headers.set('X-CSRF-Token', csrfToken)
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...requestInit,
    headers,
    credentials: 'include',
  })

  if (!response.ok) {
    let body: ApiErrorBody = {}
    try {
      body = (await response.json()) as ApiErrorBody
    } catch {
      // Keep the stable HTTP status error when the server did not return JSON.
    }
    throw new ApiError(response.status, body)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export async function fetchPlatformStatus(signal?: AbortSignal): Promise<PlatformStatus> {
  return apiRequest<PlatformStatus>('/api/v1/platform', { signal })
}

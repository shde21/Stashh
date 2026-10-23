export type UserRole = 'STARTUP' | 'INVESTOR' | 'ADMIN'

export type AuthUser = {
  id: number
  email: string
  role: UserRole
}

export type LoginCredentials = {
  email: string
  password: string
}

export type RegistrationInput = LoginCredentials & {
  role: Exclude<UserRole, 'ADMIN'>
}

export function roleLabel(role: UserRole): string {
  if (role === 'STARTUP') return 'Startup'
  if (role === 'INVESTOR') return 'Investor'
  return 'Admin'
}

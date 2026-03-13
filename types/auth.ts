export type UserRole = 'free' | 'premium'

export type UserProfile = {
  id: string
  email: string
  displayName: string
  role: UserRole
  createdAt: string
}

export type AuthSession = {
  user: UserProfile
  token: string
}

export type AuthResponse = {
  ok: boolean
  message?: string
  session?: AuthSession
}

import type { AuthResponse } from '~~/types/auth'
import { getCurrentUser } from '~~/server/utils/session'
import { listPurchasesByUser } from '~~/server/utils/repositories'

export default defineEventHandler(async (event): Promise<AuthResponse> => {
  const user = await getCurrentUser(event)
  if (!user) {
    return { ok: false, message: 'No active session' }
  }

  const purchases = await listPurchasesByUser(user.id)
  const role = purchases.length > 0 ? 'premium' : 'free'

  return {
    ok: true,
    session: {
      token: 'cookie-session',
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role,
        createdAt: user.createdAt
      }
    }
  }
})

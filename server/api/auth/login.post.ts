import { z } from 'zod'
import type { AuthResponse } from '~~/types/auth'
import { createSessionToken, setAuthTokenCookie, verifyPassword } from '~~/server/utils/auth'
import { findUserByEmail, listPurchasesByUser } from '~~/server/utils/repositories'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(128)
})

export default defineEventHandler(async (event): Promise<AuthResponse> => {
  const body = schema.parse(await readBody(event))
  const user = await findUserByEmail(body.email)

  if (!user || !verifyPassword(body.password, user.passwordHash)) {
    throw createError({ statusCode: 401, message: 'Invalid credentials' })
  }

  const purchases = await listPurchasesByUser(user.id)
  const role = purchases.length > 0 ? 'premium' : 'free'

  const token = createSessionToken({
    userId: user.id,
    email: user.email,
    role
  })

  setAuthTokenCookie(event, token)

  return {
    ok: true,
    session: {
      token,
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

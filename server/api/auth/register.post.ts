import { z } from 'zod'
import type { AuthResponse } from '~~/types/auth'
import { createSessionToken, hashPassword, setAuthTokenCookie } from '~~/server/utils/auth'
import { createUser, findUserByEmail } from '~~/server/utils/repositories'

const schema = z.object({
  displayName: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(6).max(128)
})

export default defineEventHandler(async (event): Promise<AuthResponse> => {
  const body = schema.parse(await readBody(event))
  const existing = await findUserByEmail(body.email)

  if (existing) {
    throw createError({ statusCode: 409, message: 'Email already exists' })
  }

  const user = await createUser({
    displayName: body.displayName,
    email: body.email,
    passwordHash: hashPassword(body.password)
  })

  const token = createSessionToken({
    userId: user.id,
    email: user.email,
    role: 'free'
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
        role: 'free',
        createdAt: user.createdAt
      }
    }
  }
})

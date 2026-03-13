import { H3Event } from 'h3'
import { getAuthTokenFromCookie, verifySessionToken } from '~~/server/utils/auth'
import { listUsers } from '~~/server/utils/repositories'

export async function getCurrentUser(event: H3Event) {
  const token = getAuthTokenFromCookie(event)
  const payload = verifySessionToken(token)
  if (!payload) {
    return null
  }

  const users = await listUsers()
  return users.find((item) => item.id === payload.userId) || null
}

export async function requireUser(event: H3Event) {
  const user = await getCurrentUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return user
}

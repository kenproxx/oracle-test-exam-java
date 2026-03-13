import { clearAuthTokenCookie } from '~~/server/utils/auth'

export default defineEventHandler((event) => {
  clearAuthTokenCookie(event)
  return { ok: true }
})

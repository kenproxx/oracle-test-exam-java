import { getCurrentUser } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  const user = await getCurrentUser(event)

  return {
    ok: true,
    data: {
      userId: user?.id || null,
      provider: 'mock',
      status: 'ready'
    }
  }
})

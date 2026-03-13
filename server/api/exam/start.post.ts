import { z } from 'zod'
import { requireUser } from '~~/server/utils/session'
import { getCourseAccessStatus } from '~~/server/utils/access'

const bodySchema = z.object({
  courseId: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = bodySchema.parse(await readBody(event))
  const access = await getCourseAccessStatus(user.id, body.courseId)

  const allowed = access.hasCourseAccess || access.remaining > 0

  return {
    ok: true,
    data: {
      allowed,
      reason: allowed ? null : 'FREE_LIMIT_REACHED',
      remaining: Number.isFinite(access.remaining) ? access.remaining : null,
      unlocked: access.hasCourseAccess
    }
  }
})

import { z } from 'zod'
import { requireUser } from '~~/server/utils/session'
import { listExamHistoryByUser } from '~~/server/utils/repositories'
import { getCourseAccessStatus } from '~~/server/utils/access'

const querySchema = z.object({
  sessionId: z.string().uuid()
})

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const query = querySchema.parse(getQuery(event))
  const history = await listExamHistoryByUser(user.id)

  const record = history.find((item) => item.sessionId === query.sessionId)
  if (!record) {
    throw createError({ statusCode: 404, message: 'Result not found' })
  }

  const access = await getCourseAccessStatus(user.id, record.courseId)
  const result = access.hasCourseAccess
    ? record
    : {
        ...record,
        detailUnlocked: false,
        details: []
      }

  return {
    ok: true,
    data: result
  }
})

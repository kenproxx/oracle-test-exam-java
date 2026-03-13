import { z } from 'zod'
import { COURSE_IDS } from '~~/data/courses'
import { requireUser } from '~~/server/utils/session'
import { addPurchase } from '~~/server/utils/repositories'

const bodySchema = z.object({
  scope: z.enum(['course', 'full']),
  courseId: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = bodySchema.parse(await readBody(event))

  if (body.scope === 'course' && (!body.courseId || !COURSE_IDS.includes(body.courseId))) {
    throw createError({ statusCode: 400, message: 'Invalid courseId' })
  }

  await addPurchase(user.id, body.scope, body.courseId)

  return {
    ok: true,
    message: 'Payment processed (mock)'
  }
})

import { z } from 'zod'
import { loadQuestions } from '~~/server/utils/questions'

const querySchema = z.object({
  courseId: z.string().min(1),
  topic: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const query = querySchema.parse(getQuery(event))
  const set = await loadQuestions(query.courseId, query.topic)

  return set
})

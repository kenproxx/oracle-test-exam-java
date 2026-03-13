import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import type { ExamResult } from '~~/types/exam'
import { requireUser } from '~~/server/utils/session'
import { getCourseAccessStatus, getPassThreshold } from '~~/server/utils/access'
import { loadQuestions } from '~~/server/utils/questions'
import { addExamHistory } from '~~/server/utils/repositories'

const submissionSchema = z.object({
  courseId: z.string().min(1),
  answers: z.array(
    z.object({
      questionIndex: z.number().int().nonnegative().optional(),
      questionNumber: z.number(),
      selectedAnswers: z.array(z.string())
    })
  ),
  durationSeconds: z.number().nonnegative(),
  totalQuestions: z.number().positive()
})

function normalize(values: string[]) {
  return [...values].sort()
}

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const payload = submissionSchema.parse(await readBody(event))

  const access = await getCourseAccessStatus(user.id, payload.courseId)
  if (!access.hasCourseAccess && access.remaining <= 0) {
    throw createError({ statusCode: 402, message: 'Free mock attempt limit reached' })
  }

  const questionSet = await loadQuestions(payload.courseId)
  const answersByIndex = new Map<number, string[]>()
  payload.answers.forEach((item, index) => {
    const key = item.questionIndex ?? index
    answersByIndex.set(key, item.selectedAnswers)
  })

  const details = questionSet.questions.map((question, index) => {
    const selectedAnswers = answersByIndex.get(index) || []
    const expected = normalize(question.correct_answers)
    const selected = normalize(selectedAnswers)
    const isCorrect = expected.length === selected.length && expected.every((item, index) => item === selected[index])

    return {
      questionNumber: question.question_number,
      selectedAnswers,
      correctAnswers: question.correct_answers,
      isCorrect,
      explanation: question.explanation,
      question: question.question
    }
  })

  const score = details.filter((item) => item.isCorrect).length
  const total = questionSet.questions.length
  const percentage = total > 0 ? Math.round((score / total) * 10000) / 100 : 0
  const threshold = getPassThreshold(payload.courseId)
  const passed = percentage >= threshold

  const storedResult: ExamResult = {
    sessionId: randomUUID(),
    courseId: payload.courseId,
    score,
    total,
    percentage,
    passed,
    threshold,
    submittedAt: new Date().toISOString(),
    durationSeconds: payload.durationSeconds,
    detailUnlocked: true,
    details
  }

  await addExamHistory({
    ...storedResult,
    userId: user.id
  })

  const responseResult: ExamResult = access.hasCourseAccess
    ? storedResult
    : {
        ...storedResult,
        detailUnlocked: false,
        details: []
      }

  return {
    ok: true,
    data: responseResult
  }
})

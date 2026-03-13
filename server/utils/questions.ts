import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { z } from 'zod'
import type { QuestionSet } from '~~/types/question'

const questionSchema = z.object({
  topic: z.string(),
  question_number: z.number(),
  question: z.string(),
  options: z.record(z.string(), z.string()),
  correct_answers: z.array(z.string()),
  explanation: z.string(),
  multi: z.boolean()
})

const questionSetSchema = z.object({
  questions: z.array(questionSchema)
})

async function parseQuestionPayload(payload: unknown, courseId: string) {
  if (payload && typeof payload === 'object' && courseId in (payload as Record<string, unknown>)) {
    const nested = (payload as Record<string, unknown>)[courseId]
    return questionSetSchema.parse(nested)
  }

  if (Array.isArray(payload)) {
    return questionSetSchema.parse({ questions: payload })
  }

  return questionSetSchema.parse(payload)
}

async function loadFromRemote(courseId: string) {
  const config = useRuntimeConfig()
  const source = config.questionsSourceUrl
  if (!source) {
    return null
  }

  const endpoint = source.includes('{courseId}') ? source.replace('{courseId}', courseId) : source
  const payload = await $fetch(endpoint)
  return parseQuestionPayload(payload, courseId)
}

async function loadFromLocal(courseId: string) {
  const filePath = join(process.cwd(), 'data', 'questions', `${courseId}.json`)
  const raw = await readFile(filePath, 'utf-8')
  const payload = JSON.parse(raw)
  return questionSetSchema.parse(payload)
}

export async function loadQuestions(courseId: string, topic?: string): Promise<QuestionSet> {
  let set: QuestionSet

  try {
    const remote = await loadFromRemote(courseId)
    if (remote) {
      set = remote
    } else {
      set = await loadFromLocal(courseId)
    }
  } catch {
    set = await loadFromLocal(courseId)
  }

  const filtered = topic
    ? set.questions.filter((question) => question.topic.toLowerCase() === topic.toLowerCase())
    : set.questions

  return {
    questions: filtered.sort((a, b) => a.question_number - b.question_number)
  }
}

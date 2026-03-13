import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { z } from 'zod'
import type { QuestionSet } from '~~/types/question'

const LOCAL_QUESTION_FILE_BY_COURSE_ID: Record<string, string> = {
  'oca-8': 'oca_java8_questions.json',
  'ocp-11': 'ocp_java11_questions.json',
  'ocp-17': 'ocp_java17_questions.json',
  'ocp-21': 'ocp_java21_questions.json',
  ocm: 'ocm.json'
}

const COURSE_ID_ALIASES: Record<string, string> = {
  oca: 'oca-8',
  'oca-ocp-11': 'ocp-11',
  ocp11: 'ocp-11',
  ocp17: 'ocp-17',
  ocp21: 'ocp-21'
}

const PAYLOAD_CANDIDATE_KEYS: Record<string, string[]> = {
  'oca-8': ['oca-8', 'oca', 'oca_java8', 'oca_java8_questions'],
  'ocp-11': ['ocp-11', 'ocp11', 'ocp_java11', 'ocp_java11_questions'],
  'ocp-17': ['ocp-17', 'ocp17', 'ocp_java17', 'ocp_java17_questions'],
  'ocp-21': ['ocp-21', 'ocp21', 'ocp_java21', 'ocp_java21_questions'],
  ocm: ['ocm']
}

const QUESTION_DIR_CANDIDATES = ['question', 'questions'] as const

const optionsSchema = z
  .record(z.string(), z.unknown())
  .transform((options) => Object.fromEntries(Object.entries(options).map(([key, value]) => [key, String(value ?? '')])))

const questionSchema = z.object({
  topic: z.string(),
  question_number: z.coerce.number(),
  question: z.string(),
  options: optionsSchema,
  correct_answers: z
    .union([z.array(z.string()), z.string().transform((answer) => [answer])])
    .transform((answers) => answers.map((item) => item.trim()).filter(Boolean)),
  explanation: z.string().optional().default(''),
  multi: z.boolean().optional()
}).transform((question) => ({
  ...question,
  multi: question.multi ?? question.correct_answers.length > 1
}))

const questionSetSchema = z.object({
  questions: z.array(questionSchema)
})

function normalizeCourseId(courseId: string) {
  return COURSE_ID_ALIASES[courseId] || courseId
}

function payloadKeysForCourse(courseId: string) {
  const normalizedCourseId = normalizeCourseId(courseId)
  const keys = new Set<string>([courseId, normalizedCourseId])

  for (const [alias, canonical] of Object.entries(COURSE_ID_ALIASES)) {
    if (canonical === normalizedCourseId) {
      keys.add(alias)
    }
  }

  const extraKeys = PAYLOAD_CANDIDATE_KEYS[normalizedCourseId] || []
  extraKeys.forEach((key) => keys.add(key))

  return [...keys]
}

function parseQuestionPayloadRecursive(payload: unknown, courseKeys: string[]): QuestionSet {
  if (Array.isArray(payload)) {
    return questionSetSchema.parse({ questions: payload })
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>

    if (Array.isArray(record.questions)) {
      return questionSetSchema.parse({ questions: record.questions })
    }

    for (const key of courseKeys) {
      if (key in record) {
        try {
          return parseQuestionPayloadRecursive(record[key], courseKeys)
        } catch {
          // Try the next candidate key.
        }
      }
    }

    for (const wrapperKey of ['data', 'result']) {
      if (wrapperKey in record) {
        try {
          return parseQuestionPayloadRecursive(record[wrapperKey], courseKeys)
        } catch {
          // Try parsing without wrapper recursion.
        }
      }
    }

    return questionSetSchema.parse(record)
  }

  return questionSetSchema.parse(payload)
}

function parseQuestionPayload(payload: unknown, courseId: string) {
  return parseQuestionPayloadRecursive(payload, payloadKeysForCourse(courseId))
}

async function loadFromRemote(courseId: string) {
  const config = useRuntimeConfig()
  const source = config.questionsSourceUrl
  if (!source) {
    return null
  }

  const normalizedCourseId = normalizeCourseId(courseId)
  const endpoint = source.includes('{courseId}') ? source.replace('{courseId}', normalizedCourseId) : source
  const payload = await $fetch(endpoint)
  return parseQuestionPayload(payload, normalizedCourseId)
}

function isNotFoundError(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === 'ENOENT'
}

async function readLocalQuestionFile(fileName: string) {
  const attemptedPaths: string[] = []

  for (const directory of QUESTION_DIR_CANDIDATES) {
    const filePath = join(process.cwd(), 'data', directory, fileName)
    attemptedPaths.push(filePath)
    try {
      return await readFile(filePath, 'utf-8')
    } catch (error) {
      if (!isNotFoundError(error)) {
        throw error
      }
    }
  }

  throw createError({
    statusCode: 404,
    message: `Question file not found for "${fileName}". Tried: ${attemptedPaths.join(', ')}`
  })
}

async function loadFromLocal(courseId: string) {
  const normalizedCourseId = normalizeCourseId(courseId)
  const fileName = LOCAL_QUESTION_FILE_BY_COURSE_ID[normalizedCourseId] || `${normalizedCourseId}.json`
  const raw = await readLocalQuestionFile(fileName)
  const payload = JSON.parse(raw)
  return parseQuestionPayload(payload, normalizedCourseId)
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

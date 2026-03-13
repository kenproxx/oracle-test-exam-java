import { randomUUID } from 'node:crypto'
import { appendTableRow, readTable } from '~~/server/utils/sheetGateway'
import { decryptPayload, encryptPayload } from '~~/server/utils/crypto'
import type { ExamResult } from '~~/types/exam'
import type { PurchaseScope } from '~~/types/billing'

type EncryptedRow = {
  id: string
  cipher: string
}

type UserRecord = {
  id: string
  email: string
  displayName: string
  passwordHash: string
  role: 'free' | 'premium'
  createdAt: string
}

type PurchaseRecordInternal = {
  id: string
  userId: string
  scope: PurchaseScope
  courseId?: string
  createdAt: string
}

type HistoryRecordInternal = ExamResult & {
  userId: string
}

const TABLE_USERS = 'users'
const TABLE_PURCHASES = 'purchases'
const TABLE_HISTORY = 'exam_history'

function toEncryptedRow(value: Record<string, unknown>): Promise<EncryptedRow> {
  return encryptPayload(value).then((cipher) => ({
    id: randomUUID(),
    cipher
  }))
}

function isEncryptedRow(input: unknown): input is EncryptedRow {
  if (!input || typeof input !== 'object') {
    return false
  }

  return typeof (input as EncryptedRow).id === 'string' && typeof (input as EncryptedRow).cipher === 'string'
}

async function decryptRows<T>(rows: unknown[]): Promise<T[]> {
  const safeRows = rows.filter((row) => isEncryptedRow(row)) as EncryptedRow[]
  const values = await Promise.all(
    safeRows.map(async (row): Promise<T | null> => {
      try {
        const data = await decryptPayload<T>(row.cipher)
        return data
      } catch {
        return null
      }
    })
  )

  return values.filter((item): item is T => item !== null)
}

export async function listUsers() {
  const rows = await readTable(TABLE_USERS)
  return decryptRows<UserRecord>(rows)
}

export async function findUserByEmail(email: string) {
  const users = await listUsers()
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null
}

export async function createUser(input: Omit<UserRecord, 'id' | 'createdAt' | 'role'>) {
  const user: UserRecord = {
    id: randomUUID(),
    email: input.email,
    displayName: input.displayName,
    passwordHash: input.passwordHash,
    role: 'free',
    createdAt: new Date().toISOString()
  }

  const encrypted = await toEncryptedRow(user)
  await appendTableRow(TABLE_USERS, encrypted)

  return user
}

export async function addPurchase(userId: string, scope: PurchaseScope, courseId?: string) {
  const purchase: PurchaseRecordInternal = {
    id: randomUUID(),
    userId,
    scope,
    courseId,
    createdAt: new Date().toISOString()
  }

  const encrypted = await toEncryptedRow(purchase)
  await appendTableRow(TABLE_PURCHASES, encrypted)
  return purchase
}

export async function listPurchasesByUser(userId: string) {
  const rows = await readTable(TABLE_PURCHASES)
  const purchases = await decryptRows<PurchaseRecordInternal>(rows)
  return purchases.filter((item) => item.userId === userId)
}

export async function addExamHistory(input: HistoryRecordInternal) {
  const encrypted = await toEncryptedRow(input)
  await appendTableRow(TABLE_HISTORY, encrypted)
  return input
}

export async function listExamHistoryByUser(userId: string) {
  const rows = await readTable(TABLE_HISTORY)
  const history = await decryptRows<HistoryRecordInternal>(rows)
  return history
    .filter((item) => item.userId === userId)
    .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1))
}

export async function countExamAttempts(userId: string, courseId: string) {
  const history = await listExamHistoryByUser(userId)
  return history.filter((item) => item.courseId === courseId).length
}

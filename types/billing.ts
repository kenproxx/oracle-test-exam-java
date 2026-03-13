export type PurchaseScope = 'course' | 'full'

export type PurchaseRecord = {
  id: string
  userId: string
  scope: PurchaseScope
  courseId?: string
  createdAt: string
}

export type BillingStatus = {
  hasFullAccess: boolean
  unlockedCourseIds: string[]
  remainingFreeMocks: Record<string, number>
}

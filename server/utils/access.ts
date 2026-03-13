import { getCourseById } from '~~/data/courses'
import { listPurchasesByUser, countExamAttempts } from '~~/server/utils/repositories'

export async function getCourseAccessStatus(userId: string, courseId: string) {
  const config = useRuntimeConfig()
  const freeLimit = Number(config.public.freeMockLimit || 2)

  const purchases = await listPurchasesByUser(userId)
  const hasFullAccess = purchases.some((item) => item.scope === 'full')
  const unlockedCourseIds = purchases.filter((item) => item.scope === 'course' && item.courseId).map((item) => String(item.courseId))
  const hasCourseAccess = hasFullAccess || unlockedCourseIds.includes(courseId)

  const attempts = await countExamAttempts(userId, courseId)
  const remaining = hasCourseAccess ? Number.POSITIVE_INFINITY : Math.max(freeLimit - attempts, 0)

  return {
    hasFullAccess,
    unlockedCourseIds,
    hasCourseAccess,
    attempts,
    remaining,
    freeLimit
  }
}

export function getPassThreshold(courseId: string) {
  const config = useRuntimeConfig()
  const configured = Number(config.passThreshold || 0)
  const course = getCourseById(courseId)

  if (configured > 0) {
    return configured
  }

  return course?.passThreshold || 70
}

import { COURSE_IDS } from '~~/data/courses'
import { getCurrentUser } from '~~/server/utils/session'
import { countExamAttempts, listPurchasesByUser } from '~~/server/utils/repositories'

export default defineEventHandler(async (event) => {
  const user = await getCurrentUser(event)
  if (!user) {
    return {
      ok: true,
      data: {
        hasFullAccess: false,
        unlockedCourseIds: [],
        remainingFreeMocks: {}
      }
    }
  }

  const config = useRuntimeConfig()
  const freeLimit = Number(config.public.freeMockLimit || 2)
  const purchases = await listPurchasesByUser(user.id)
  const hasFullAccess = purchases.some((item) => item.scope === 'full')

  const unlockedCourseIds = hasFullAccess
    ? [...COURSE_IDS]
    : purchases.filter((item) => item.scope === 'course' && item.courseId).map((item) => String(item.courseId))

  const remainingFreeMocksEntries = await Promise.all(
    COURSE_IDS.map(async (courseId) => {
      if (hasFullAccess || unlockedCourseIds.includes(courseId)) {
        return [courseId, Number.POSITIVE_INFINITY] as const
      }

      const attempts = await countExamAttempts(user.id, courseId)
      return [courseId, Math.max(freeLimit - attempts, 0)] as const
    })
  )

  return {
    ok: true,
    data: {
      hasFullAccess,
      unlockedCourseIds,
      remainingFreeMocks: Object.fromEntries(remainingFreeMocksEntries)
    }
  }
})

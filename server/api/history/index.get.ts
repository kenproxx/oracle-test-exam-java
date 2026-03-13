import { COURSE_IDS } from '~~/data/courses'
import { requireUser } from '~~/server/utils/session'
import { listExamHistoryByUser, listPurchasesByUser } from '~~/server/utils/repositories'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const purchases = await listPurchasesByUser(user.id)

  if (purchases.length === 0) {
    return {
      ok: true,
      data: {
        locked: true,
        items: []
      }
    }
  }

  const hasFullAccess = purchases.some((item) => item.scope === 'full')
  const unlockedCourseIds = hasFullAccess
    ? COURSE_IDS
    : purchases.filter((item) => item.scope === 'course' && item.courseId).map((item) => String(item.courseId))

  const history = await listExamHistoryByUser(user.id)
  const visibleItems = history
    .filter((item) => unlockedCourseIds.includes(item.courseId))
    .map((item) => ({
      sessionId: item.sessionId,
      courseId: item.courseId,
      score: item.score,
      total: item.total,
      percentage: item.percentage,
      passed: item.passed,
      threshold: item.threshold,
      submittedAt: item.submittedAt,
      durationSeconds: item.durationSeconds
    }))

  return {
    ok: true,
    data: {
      locked: false,
      items: visibleItems
    }
  }
})

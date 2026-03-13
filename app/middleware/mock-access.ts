import { useAuthStore } from '~/stores/auth'
import { useBillingStore } from '~/stores/billing'

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  const billingStore = useBillingStore()

  await authStore.bootstrap()
  if (!authStore.isLoggedIn) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }

  if (!billingStore.status.unlockedCourseIds.length && !billingStore.status.hasFullAccess) {
    await billingStore.refresh()
  }

  const courseId = String(to.params.courseId || '')
  if (!courseId) {
    return
  }

  try {
    const response = await $fetch<{ ok: boolean; data?: { allowed: boolean; reason?: string } }>('/api/exam/start', {
      method: 'POST',
      body: { courseId }
    })

    if (!response.ok || !response.data?.allowed) {
      return navigateTo(`/pricing?courseId=${courseId}&reason=limit`)
    }
  } catch {
    return navigateTo(`/pricing?courseId=${courseId}&reason=limit`)
  }
})


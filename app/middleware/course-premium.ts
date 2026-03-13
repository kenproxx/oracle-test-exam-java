import { useAuthStore } from '~/stores/auth'
import { useBillingStore } from '~/stores/billing'

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  const billingStore = useBillingStore()

  await authStore.bootstrap()
  if (!authStore.isLoggedIn) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }

  await billingStore.refresh()

  const courseId = String(to.params.courseId || to.query.courseId || '')
  if (courseId && !billingStore.hasAccess(courseId)) {
    return navigateTo(`/pricing?courseId=${courseId}`)
  }
})


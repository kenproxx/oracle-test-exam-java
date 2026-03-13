import { useAuthStore } from '~/stores/auth'
import { useBillingStore } from '~/stores/billing'
import { useCourseStore } from '~/stores/course'

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  const billingStore = useBillingStore()
  const courseStore = useCourseStore()

  await authStore.bootstrap()
  if (authStore.isLoggedIn) {
    await billingStore.refresh()
  }

  courseStore.prewarmQuestionCache()
})


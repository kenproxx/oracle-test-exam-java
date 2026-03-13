import { useAuthStore } from '~/stores/auth'
import { useBillingStore } from '~/stores/billing'

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  const billingStore = useBillingStore()

  await authStore.bootstrap()
  if (authStore.isLoggedIn) {
    await billingStore.refresh()
  }
})


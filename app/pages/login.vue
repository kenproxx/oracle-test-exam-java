<template>
  <section class="mx-auto max-w-md">
    <form class="card space-y-4" @submit.prevent="onSubmit">
      <h1 class="text-2xl font-bold text-slate-900">{{ t('auth.loginTitle') }}</h1>

      <div>
        <label class="mb-1 block text-sm font-semibold text-slate-700">{{ t('auth.email') }}</label>
        <input v-model="email" type="email" required class="w-full rounded-xl border border-slate-300 px-3 py-2">
      </div>

      <div>
        <label class="mb-1 block text-sm font-semibold text-slate-700">{{ t('auth.password') }}</label>
        <input v-model="password" type="password" required class="w-full rounded-xl border border-slate-300 px-3 py-2">
      </div>

      <p v-if="errorMessage" class="text-sm text-rose-700">{{ errorMessage }}</p>

      <button class="btn-primary w-full" :disabled="authStore.loading">{{ t('nav.login') }}</button>
      <p class="text-sm text-slate-600">
        {{ t('auth.noAccount') }}
        <NuxtLink :to="localePath('/register')" class="font-semibold text-brand-700 hover:underline">{{ t('nav.register') }}</NuxtLink>
      </p>
    </form>
  </section>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useBillingStore } from '~/stores/billing'

const route = useRoute()
const localePath = useLocalePath()
const { t } = useI18n()

const authStore = useAuthStore()
const billingStore = useBillingStore()

const email = ref('')
const password = ref('')
const errorMessage = ref('')

async function onSubmit() {
  errorMessage.value = ''
  const response = await authStore.login(email.value, password.value)

  if (!response.ok) {
    errorMessage.value = response.message || 'Login failed'
    return
  }

  await billingStore.refresh()
  const redirect = String(route.query.redirect || '/courses')
  await navigateTo(redirect)
}
</script>


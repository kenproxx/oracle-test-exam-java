<template>
  <section class="mx-auto max-w-md">
    <form class="card space-y-4" @submit.prevent="onSubmit">
      <h1 class="text-2xl font-bold text-slate-900">{{ t('auth.registerTitle') }}</h1>

      <div>
        <label class="mb-1 block text-sm font-semibold text-slate-700">{{ t('auth.name') }}</label>
        <input v-model="name" type="text" required class="w-full rounded-xl border border-slate-300 px-3 py-2">
      </div>

      <div>
        <label class="mb-1 block text-sm font-semibold text-slate-700">{{ t('auth.email') }}</label>
        <input v-model="email" type="email" required class="w-full rounded-xl border border-slate-300 px-3 py-2">
      </div>

      <div>
        <label class="mb-1 block text-sm font-semibold text-slate-700">{{ t('auth.password') }}</label>
        <input v-model="password" type="password" required minlength="6" class="w-full rounded-xl border border-slate-300 px-3 py-2">
      </div>

      <p v-if="errorMessage" class="text-sm text-rose-700">{{ errorMessage }}</p>

      <button class="btn-primary w-full" :disabled="authStore.loading">{{ t('nav.register') }}</button>
      <p class="text-sm text-slate-600">
        {{ t('auth.hasAccount') }}
        <NuxtLink :to="localePath('/login')" class="font-semibold text-brand-700 hover:underline">{{ t('nav.login') }}</NuxtLink>
      </p>
    </form>
  </section>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useBillingStore } from '~/stores/billing'

const localePath = useLocalePath()
const { t } = useI18n()

const authStore = useAuthStore()
const billingStore = useBillingStore()

const name = ref('')
const email = ref('')
const password = ref('')
const errorMessage = ref('')

async function onSubmit() {
  errorMessage.value = ''
  const response = await authStore.register(name.value, email.value, password.value)

  if (!response.ok) {
    errorMessage.value = response.message || 'Register failed'
    return
  }

  await billingStore.refresh()
  await navigateTo('/courses')
}
</script>


<template>
  <section class="space-y-4">
    <div class="card">
      <h1 class="text-2xl font-bold text-slate-900">{{ t('pricing.title') }}</h1>
      <p class="mt-2 text-sm text-slate-600">{{ t('pricing.benefits') }}</p>
      <p v-if="reason === 'limit'" class="mt-3 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700">
        {{ t('mock.blocked') }}
      </p>
    </div>

    <div class="card flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-sm text-slate-500">{{ t('pricing.full') }}</p>
        <p class="text-3xl font-extrabold text-slate-900">$49</p>
      </div>
      <button class="btn-primary" :disabled="!authStore.isLoggedIn || billingStore.status.hasFullAccess" @click="buyFull">
        {{ billingStore.status.hasFullAccess ? t('common.unlocked') : t('pricing.buyNow') }}
      </button>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <article
        v-for="course in courseStore.courses"
        :key="course.id"
        class="card"
        :class="focusCourseId === course.id ? 'ring-2 ring-brand-400' : ''"
      >
        <h2 class="text-lg font-bold text-slate-900">{{ course.code }}</h2>
        <p class="mt-1 text-sm text-slate-600">{{ course.shortDescription[locale as 'vi' | 'en'] }}</p>
        <p class="mt-3 text-xl font-extrabold text-slate-900">$19</p>
        <button class="btn-secondary mt-3" :disabled="!authStore.isLoggedIn || billingStore.hasAccess(course.id)" @click="buyCourse(course.id)">
          {{ billingStore.hasAccess(course.id) ? t('common.unlocked') : t('pricing.buyNow') }}
        </button>
      </article>
    </div>

    <p v-if="!authStore.isLoggedIn" class="text-sm text-slate-600">
      <NuxtLink :to="localePath('/login')" class="font-semibold text-brand-700 hover:underline">{{ t('nav.login') }}</NuxtLink>
      to complete purchase.
    </p>
  </section>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useBillingStore } from '~/stores/billing'
import { useCourseStore } from '~/stores/course'

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()

const authStore = useAuthStore()
const courseStore = useCourseStore()
const billingStore = useBillingStore()

await authStore.bootstrap()
if (authStore.isLoggedIn) {
  await billingStore.refresh()
}

const focusCourseId = computed(() => String(route.query.courseId || ''))
const reason = computed(() => String(route.query.reason || ''))

async function buyFull() {
  const response = await billingStore.purchase('full')
  if (!response.ok) {
    alert(response.message || 'Purchase failed')
  }
}

async function buyCourse(courseId: string) {
  const response = await billingStore.purchase('course', courseId)
  if (!response.ok) {
    alert(response.message || 'Purchase failed')
  }
}
</script>


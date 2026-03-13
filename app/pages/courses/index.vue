<template>
  <section>
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-bold text-slate-900">{{ t('nav.courses') }}</h1>
      <p class="text-sm text-slate-600">{{ t('course.freeAttemptInfo') }}</p>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <CourseCard
        v-for="course in courseStore.courses"
        :key="course.id"
        :course="course"
        :unlocked="billingStore.hasAccess(course.id)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useBillingStore } from '~/stores/billing'
import { useCourseStore } from '~/stores/course'

const { t } = useI18n()
const courseStore = useCourseStore()
const billingStore = useBillingStore()
const authStore = useAuthStore()

await authStore.bootstrap()
if (authStore.isLoggedIn) {
  await billingStore.refresh()
}
</script>


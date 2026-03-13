<template>
  <section v-if="course" class="space-y-5">
    <div class="card">
      <p class="text-xs font-semibold uppercase tracking-wider text-brand-700">{{ course.code }}</p>
      <h1 class="mt-1 text-3xl font-bold text-slate-900">{{ title }}</h1>
      <p class="mt-3 text-slate-600">{{ description }}</p>

      <div class="mt-4 flex flex-wrap gap-3">
        <NuxtLink :to="localePath(`/practice/${course.id}`)" class="btn-secondary">{{ t('course.practice') }}</NuxtLink>
        <NuxtLink :to="localePath(`/mock/${course.id}`)" class="btn-primary">{{ t('course.mock') }}</NuxtLink>
        <NuxtLink v-if="!billingStore.hasAccess(course.id)" :to="localePath(`/pricing?courseId=${course.id}`)" class="btn-secondary">{{ t('course.unlock') }}</NuxtLink>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <article v-for="topic in course.topics" :key="topic.id" class="card">
        <h3 class="text-lg font-bold text-slate-900">{{ topic.title[locale as 'vi' | 'en'] }}</h3>
        <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li v-for="lesson in topic.lessons" :key="lesson.en">{{ lesson[locale as 'vi' | 'en'] }}</li>
        </ul>
      </article>
    </div>
  </section>

  <section v-else class="card">Course not found</section>
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

const course = computed(() => courseStore.byId(String(route.params.id)))
const title = computed(() => course.value?.title[locale.value as 'vi' | 'en'] || '')
const description = computed(() => course.value?.shortDescription[locale.value as 'vi' | 'en'] || '')
</script>

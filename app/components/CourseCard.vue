<template>
  <article class="card flex h-full flex-col gap-4">
    <div>
      <p class="text-xs font-semibold uppercase tracking-wider text-brand-700">{{ course.code }}</p>
      <h3 class="mt-1 text-xl font-bold text-slate-900">{{ title }}</h3>
      <p class="mt-2 text-sm text-slate-600">{{ description }}</p>
    </div>

    <div class="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
      <p>{{ t('course.topics') }}: <b>{{ course.topics.length }}</b></p>
      <p>{{ t('common.minutes') }}: <b>{{ course.examMinutes }}</b></p>
      <p>
        Premium: <b>{{ unlocked ? t('common.unlocked') : t('common.locked') }}</b>
      </p>
    </div>

    <div class="mt-auto flex flex-wrap gap-2">
      <NuxtLink :to="localePath(`/practice/${course.id}`)" class="btn-secondary text-sm">{{ t('course.practice') }}</NuxtLink>
      <NuxtLink :to="localePath(`/mock/${course.id}`)" class="btn-primary text-sm">{{ t('course.mock') }}</NuxtLink>
      <NuxtLink
        v-if="!unlocked"
        :to="localePath(`/pricing?courseId=${course.id}`)"
        class="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800"
      >
        {{ t('course.unlock') }}
      </NuxtLink>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { CourseDefinition } from '~~/types/course'

type Props = {
  course: CourseDefinition
  unlocked: boolean
}

const props = defineProps<Props>()
const { locale, t } = useI18n()
const localePath = useLocalePath()

const title = computed(() => props.course.title[locale.value as 'vi' | 'en'])
const description = computed(() => props.course.shortDescription[locale.value as 'vi' | 'en'])
</script>


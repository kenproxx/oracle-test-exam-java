<template>
  <section class="space-y-4">
    <div class="card">
      <h1 class="text-2xl font-bold text-slate-900">{{ t('history.title') }}</h1>
      <p v-if="state.locked" class="mt-2 text-sm text-slate-600">{{ t('history.locked') }}</p>
      <UnlockBanner
        v-if="state.locked"
        course-id="oca-ocp-11"
        :message="t('history.locked')"
        :label="t('nav.pricing')"
      />
    </div>

    <div v-if="!state.locked" class="card overflow-x-auto">
      <table class="min-w-full text-left text-sm">
        <thead class="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
          <tr>
            <th class="py-2 pr-4">Course</th>
            <th class="py-2 pr-4">Score</th>
            <th class="py-2 pr-4">Status</th>
            <th class="py-2 pr-4">Time</th>
            <th class="py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in state.items" :key="item.sessionId" class="border-b border-slate-100">
            <td class="py-3 pr-4">{{ item.courseId }}</td>
            <td class="py-3 pr-4">{{ item.score }}/{{ item.total }} ({{ item.percentage }}%)</td>
            <td class="py-3 pr-4">
              <span :class="item.passed ? 'text-emerald-700' : 'text-rose-700'">{{ item.passed ? t('result.passed') : t('result.failed') }}</span>
            </td>
            <td class="py-3 pr-4">{{ formatDate(item.submittedAt) }}</td>
            <td class="py-3">
              <NuxtLink :to="localePath(`/result/${item.sessionId}`)" class="text-brand-700 hover:underline">View</NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth-required']
})

type HistoryItem = {
  sessionId: string
  courseId: string
  score: number
  total: number
  percentage: number
  passed: boolean
  submittedAt: string
}

const { t } = useI18n()
const localePath = useLocalePath()

const response = await $fetch<{ ok: boolean; data: { locked: boolean; items: HistoryItem[] } }>('/api/history')
const state = reactive({
  locked: response.data.locked,
  items: response.data.items
})

function formatDate(value: string) {
  return new Date(value).toLocaleString()
}
</script>


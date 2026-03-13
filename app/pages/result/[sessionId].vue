<template>
  <section v-if="result" class="space-y-4">
    <ResultSummary :result="result" />

    <UnlockBanner
      v-if="!result.detailUnlocked"
      :course-id="result.courseId"
      :message="t('result.detailLocked')"
      :label="t('course.unlock')"
    />

    <div class="card" :class="!result.detailUnlocked ? 'pointer-events-none blur-sm select-none' : ''">
      <h2 class="text-lg font-bold text-slate-900">Details</h2>
      <div v-if="result.details.length > 0" class="mt-3 space-y-3">
        <article
          v-for="(item, itemIndex) in result.details"
          :key="`${item.questionNumber}-${itemIndex}`"
          class="rounded-xl border border-slate-200 p-3"
          :class="item.isCorrect ? 'bg-emerald-50/70' : 'bg-rose-50/70'"
        >
          <p class="font-semibold text-slate-900">Q{{ item.questionNumber }}.</p>
          <RichTextBlock class="mt-1 text-slate-900" :text="item.question" />
          <p class="mt-1 text-sm text-slate-700">Selected: {{ item.selectedAnswers.join(', ') || '-' }}</p>
          <p class="text-sm text-slate-700">Correct: {{ item.correctAnswers.join(', ') || '-' }}</p>
          <RichTextBlock class="mt-2 text-sm text-slate-600" :text="item.explanation" />
        </article>
      </div>
      <p v-else class="mt-2 text-sm text-slate-500">No detail available.</p>
    </div>

    <NuxtLink :to="localePath('/history')" class="btn-secondary inline-flex">{{ t('nav.history') }}</NuxtLink>
  </section>

  <section v-else class="card">{{ t('common.loading') }}</section>
</template>

<script setup lang="ts">
import type { ExamResult } from '~~/types/exam'
import { useExamSessionStore } from '~/stores/examSession'

definePageMeta({
  middleware: ['auth-required']
})

const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()
const examStore = useExamSessionStore()

const result = ref<ExamResult | null>(null)
const sessionId = String(route.params.sessionId)

if (examStore.lastResult?.sessionId === sessionId) {
  result.value = examStore.lastResult
} else {
  const response = await $fetch<{ ok: boolean; data: ExamResult }>('/api/history/result', {
    query: { sessionId }
  })

  if (response.ok) {
    result.value = response.data
  }
}
</script>

<template>
  <div class="card">
    <h1 class="text-2xl font-bold text-slate-900">{{ t('result.title') }}</h1>
    <div class="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
      <div class="rounded-xl bg-slate-50 p-3">
        <p class="text-xs uppercase tracking-wide text-slate-500">{{ t('result.score') }}</p>
        <p class="text-lg font-bold text-slate-900">{{ result.score }}/{{ result.total }}</p>
      </div>
      <div class="rounded-xl bg-slate-50 p-3">
        <p class="text-xs uppercase tracking-wide text-slate-500">%</p>
        <p class="text-lg font-bold text-slate-900">{{ result.percentage }}%</p>
      </div>
      <div class="rounded-xl bg-slate-50 p-3">
        <p class="text-xs uppercase tracking-wide text-slate-500">Threshold</p>
        <p class="text-lg font-bold text-slate-900">{{ result.threshold }}%</p>
      </div>
      <div class="rounded-xl p-3" :class="result.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'">
        <p class="text-xs uppercase tracking-wide">Status</p>
        <p class="text-lg font-bold">{{ result.passed ? t('result.passed') : t('result.failed') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ExamResult } from '~~/types/exam'

defineProps<{ result: ExamResult }>()
const { t } = useI18n()
</script>


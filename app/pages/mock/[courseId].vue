<template>
  <section v-if="course && currentQuestion" class="space-y-4">
    <div class="card flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wider text-brand-700">{{ course.code }}</p>
        <h1 class="text-2xl font-bold text-slate-900">{{ t('mock.title') }}</h1>
      </div>
      <ExamTimer :seconds="timeLeft" />
    </div>

    <div class="card">
      <p class="text-sm font-semibold text-brand-700">{{ t('common.question') }} {{ examStore.currentIndex + 1 }}/{{ examStore.totalQuestions }}</p>
      <RichTextBlock class="mt-2 text-lg font-semibold text-slate-900" :text="currentQuestion.question" />

      <QuestionOptions
        :key="`mock-${examStore.currentIndex}`"
        class="mt-4"
        :name="`mock-${examStore.currentIndex}`"
        :options="currentQuestion.options"
        :multi="currentQuestion.multi"
        v-model="selectedAnswers"
      />

      <div class="mt-5 flex flex-wrap gap-2">
        <button class="btn-secondary" :disabled="examStore.currentIndex === 0" @click="goBack">{{ t('common.back') }}</button>
        <button class="btn-secondary" :disabled="examStore.currentIndex >= examStore.totalQuestions - 1" @click="goNext">{{ t('common.next') }}</button>
        <button class="btn-primary" :disabled="examStore.loading" @click="submitExam(false)">{{ t('common.submit') }}</button>
      </div>
    </div>

    <div class="card">
      <p class="mb-2 text-sm font-semibold text-slate-700">Navigator</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="(question, index) in examStore.questions"
          :key="`${question.question_number}-${index}`"
          class="h-9 w-9 rounded-lg border text-sm font-semibold"
          :class="isAnswered(index) ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-300 text-slate-500'"
          @click="examStore.setCurrentIndex(index)"
        >
          {{ index + 1 }}
        </button>
      </div>
    </div>
  </section>

  <section v-else class="card">{{ t('common.loading') }}</section>
</template>

<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core'
import { useCourseStore } from '~/stores/course'
import { useExamSessionStore } from '~/stores/examSession'

definePageMeta({
  middleware: ['auth-required', 'mock-access']
})

const route = useRoute()
const courseId = String(route.params.courseId)
const { t } = useI18n()

const courseStore = useCourseStore()
const examStore = useExamSessionStore()

const course = computed(() => courseStore.byId(courseId))
const questions = await courseStore.fetchQuestions(courseId)
examStore.startMock(courseId, questions)

const initialSeconds = computed(() => (course.value?.examMinutes || 60) * 60)
const timeLeft = ref(initialSeconds.value)

const { pause, resume } = useIntervalFn(() => {
  if (timeLeft.value <= 1) {
    timeLeft.value = 0
    pause()
    submitExam(true)
    return
  }

  timeLeft.value -= 1
}, 1000)

resume()

onBeforeUnmount(() => {
  pause()
})

const currentQuestion = computed(() => examStore.currentQuestion)

const selectedAnswers = computed<string[]>({
  get() {
    if (!currentQuestion.value) {
      return []
    }
    return examStore.selectedFor(examStore.currentIndex)
  },
  set(value) {
    if (!currentQuestion.value) {
      return
    }
    examStore.selectAnswer(examStore.currentIndex, value)
  }
})

function isAnswered(questionIndex: number) {
  return examStore.selectedFor(questionIndex).length > 0
}

function goBack() {
  examStore.setCurrentIndex(examStore.currentIndex - 1)
}

function goNext() {
  examStore.setCurrentIndex(examStore.currentIndex + 1)
}

async function submitExam(forced: boolean) {
  if (!forced && !confirm(t('mock.submitConfirm'))) {
    return
  }

  pause()

  try {
    const response = await examStore.submitMock()
    if (!response.ok) {
      throw new Error(response.message || 'Submit failed')
    }

    await navigateTo(`/result/${response.data.sessionId}`)
  } catch (error: any) {
    if (error?.data?.statusCode === 402) {
      await navigateTo(`/pricing?courseId=${courseId}&reason=limit`)
      return
    }

    await navigateTo(`/pricing?courseId=${courseId}`)
  }
}
</script>

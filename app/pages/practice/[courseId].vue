<template>
  <section v-if="course && currentQuestion" class="space-y-4">
    <div class="card">
      <p class="text-sm text-slate-500">{{ t('practice.title') }}</p>
      <h1 class="text-2xl font-bold text-slate-900">{{ course.title[locale as 'vi' | 'en'] }}</h1>
      <p class="text-sm text-slate-600">{{ t('practice.hint') }}</p>
    </div>

    <div class="card">
      <p class="text-sm font-semibold text-brand-700">{{ t('common.question') }} {{ examStore.currentIndex + 1 }}/{{ examStore.totalQuestions }}</p>
      <RichTextBlock class="mt-2 text-lg font-semibold text-slate-900" :text="currentQuestion.question" />

      <QuestionOptions
        :key="`practice-${examStore.currentIndex}`"
        class="mt-4"
        :name="`practice-${examStore.currentIndex}`"
        :options="currentQuestion.options"
        :multi="currentQuestion.multi"
        v-model="selectedAnswers"
      />

      <div class="mt-4 flex flex-wrap gap-2">
        <button class="btn-primary" :disabled="selectedAnswers.length === 0" @click="submitCurrent">{{ t('common.submit') }}</button>
        <button class="btn-secondary" :disabled="!submitted" @click="goNext">{{ t('common.next') }}</button>
      </div>

      <div v-if="submitted && evaluation" class="mt-4 rounded-xl border p-4" :class="evaluation.isCorrect ? 'border-emerald-300 bg-emerald-50' : 'border-rose-300 bg-rose-50'">
        <p class="font-semibold" :class="evaluation.isCorrect ? 'text-emerald-700' : 'text-rose-700'">
          {{ evaluation.isCorrect ? 'Correct' : 'Incorrect' }}
        </p>
        <p class="mt-1 text-sm text-slate-700">
          Correct answer: <strong>{{ evaluation.correctAnswers.join(', ') }}</strong>
        </p>
        <RichTextBlock class="mt-2 text-sm text-slate-700" :text="evaluation.explanation" />
      </div>
    </div>
  </section>

  <section v-else-if="loading" class="card">{{ t('common.loading') }}</section>
  <section v-else class="card">No question available</section>
</template>

<script setup lang="ts">
import { useCourseStore } from '~/stores/course'
import { useExamSessionStore } from '~/stores/examSession'

const route = useRoute()
const courseId = String(route.params.courseId)
const { t, locale } = useI18n()

const courseStore = useCourseStore()
const examStore = useExamSessionStore()

const course = computed(() => courseStore.byId(courseId))
const loading = ref(true)
const submitted = ref(false)
const evaluation = ref<{ isCorrect: boolean; correctAnswers: string[]; explanation?: string } | null>(null)

const questions = await courseStore.fetchQuestions(courseId)
examStore.startPractice(courseId, questions)
loading.value = false

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

function submitCurrent() {
  if (!currentQuestion.value) {
    return
  }

  evaluation.value = examStore.evaluatePractice(examStore.currentIndex)
  submitted.value = true
}

function goNext() {
  if (examStore.currentIndex < examStore.totalQuestions - 1) {
    examStore.setCurrentIndex(examStore.currentIndex + 1)
    submitted.value = false
    evaluation.value = null
  }
}
</script>

import { defineStore } from 'pinia'
import type { ExamResult, MockExamSubmission } from '~~/types/exam'
import type { QuestionItem } from '~~/types/question'

type AnswerMap = Record<number, string[]>

export const useExamSessionStore = defineStore('exam-session', {
  state: () => ({
    mode: 'practice' as 'practice' | 'mock',
    courseId: '',
    questions: [] as QuestionItem[],
    currentIndex: 0,
    answers: {} as AnswerMap,
    startedAt: 0,
    durationSeconds: 0,
    lastResult: null as ExamResult | null,
    loading: false
  }),
  getters: {
    currentQuestion: (state) => state.questions[state.currentIndex],
    totalQuestions: (state) => state.questions.length
  },
  actions: {
    reset() {
      this.mode = 'practice'
      this.courseId = ''
      this.questions = []
      this.currentIndex = 0
      this.answers = {}
      this.startedAt = 0
      this.durationSeconds = 0
      this.lastResult = null
      this.loading = false
    },

    startPractice(courseId: string, questions: QuestionItem[]) {
      this.reset()
      this.mode = 'practice'
      this.courseId = courseId
      this.questions = questions
      this.startedAt = Date.now()
    },

    startMock(courseId: string, questions: QuestionItem[]) {
      this.reset()
      this.mode = 'mock'
      this.courseId = courseId
      this.questions = questions
      this.startedAt = Date.now()
    },

    setCurrentIndex(index: number) {
      if (index < 0 || index >= this.questions.length) {
        return
      }
      this.currentIndex = index
    },

    selectAnswer(questionIndex: number, selectedAnswers: string[]) {
      this.answers[questionIndex] = [...selectedAnswers]
    },

    selectedFor(questionIndex: number) {
      return this.answers[questionIndex] || []
    },

    evaluatePractice(questionIndex: number) {
      const question = this.questions[questionIndex]
      if (!question) {
        return { isCorrect: false, correctAnswers: [] as string[] }
      }

      const selected = this.answers[questionIndex] || []
      const expected = [...question.correct_answers].sort()
      const actual = [...selected].sort()
      const isCorrect = expected.length === actual.length && expected.every((item, index) => item === actual[index])

      return {
        isCorrect,
        correctAnswers: question.correct_answers,
        explanation: question.explanation
      }
    },

    buildSubmission(): MockExamSubmission {
      const spentSeconds = this.startedAt > 0 ? Math.max(Math.floor((Date.now() - this.startedAt) / 1000), 0) : 0
      const answers = this.questions.map((question, questionIndex) => ({
        questionIndex,
        questionNumber: question.question_number,
        selectedAnswers: this.selectedFor(questionIndex)
      }))

      return {
        courseId: this.courseId,
        answers,
        durationSeconds: spentSeconds,
        totalQuestions: this.questions.length
      }
    },

    async submitMock() {
      this.loading = true
      try {
        const payload = this.buildSubmission()
        const response = await $fetch<{ ok: boolean; data: ExamResult; message?: string }>('/api/exam/submit', {
          method: 'POST',
          body: payload
        })

        if (response.ok) {
          this.lastResult = response.data
        }

        return response
      } finally {
        this.loading = false
      }
    }
  }
})


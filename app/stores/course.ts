import { defineStore } from 'pinia'
import { COURSE_CATALOG, getCourseById } from '~~/data/courses'
import type { CourseDefinition } from '~~/types/course'
import type { QuestionItem, QuestionSet } from '~~/types/question'
import { hasEncryptedQuestions, readEncryptedQuestions, writeEncryptedQuestions } from '~/utils/secureQuestionSession'

type QuestionCache = Record<string, QuestionItem[]>
type FetchQuestionOptions = {
  silent?: boolean
}

export const useCourseStore = defineStore('course', {
  state: () => ({
    courses: COURSE_CATALOG as CourseDefinition[],
    questionCache: {} as QuestionCache,
    loading: false,
    prewarmed: false
  }),
  getters: {
    byId: () => (courseId: string) => getCourseById(courseId)
  },
  actions: {
    async fetchQuestions(courseId: string, topic?: string, options: FetchQuestionOptions = {}) {
      const cacheKey = `${courseId}:${topic || 'all'}`
      if (this.questionCache[cacheKey]) {
        return this.questionCache[cacheKey]
      }

      if (import.meta.client) {
        const encryptedCached = await readEncryptedQuestions(cacheKey)
        if (encryptedCached?.length) {
          this.questionCache[cacheKey] = encryptedCached
          return encryptedCached
        }
      }

      const shouldToggleLoading = !options.silent
      if (shouldToggleLoading) {
        this.loading = true
      }

      try {
        const response = await $fetch<QuestionSet>('/api/questions', {
          query: {
            courseId,
            topic
          }
        })
        this.questionCache[cacheKey] = response.questions
        if (import.meta.client) {
          void writeEncryptedQuestions(cacheKey, response.questions)
        }
        return response.questions
      } finally {
        if (shouldToggleLoading) {
          this.loading = false
        }
      }
    },
    prewarmQuestionCache() {
      if (!import.meta.client || this.prewarmed) {
        return
      }

      this.prewarmed = true
      const run = async () => {
        for (const course of this.courses) {
          const key = `${course.id}:all`
          if (this.questionCache[key] || hasEncryptedQuestions(key)) {
            continue
          }

          try {
            await this.fetchQuestions(course.id, undefined, { silent: true })
          } catch {
            // Ignore warmup errors to keep background task non-blocking.
          }
        }
      }

      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          void run()
        }, { timeout: 2000 })
      } else {
        setTimeout(() => {
          void run()
        }, 400)
      }
    }
  }
})


import { defineStore } from 'pinia'
import { COURSE_CATALOG, getCourseById } from '~~/data/courses'
import type { CourseDefinition } from '~~/types/course'
import type { QuestionItem, QuestionSet } from '~~/types/question'

type QuestionCache = Record<string, QuestionItem[]>

export const useCourseStore = defineStore('course', {
  state: () => ({
    courses: COURSE_CATALOG as CourseDefinition[],
    questionCache: {} as QuestionCache,
    loading: false
  }),
  getters: {
    byId: () => (courseId: string) => getCourseById(courseId)
  },
  actions: {
    async fetchQuestions(courseId: string, topic?: string) {
      const cacheKey = `${courseId}:${topic || 'all'}`
      if (this.questionCache[cacheKey]) {
        return this.questionCache[cacheKey]
      }

      this.loading = true
      try {
        const response = await $fetch<QuestionSet>('/api/questions', {
          query: {
            courseId,
            topic
          }
        })
        this.questionCache[cacheKey] = response.questions
        return response.questions
      } finally {
        this.loading = false
      }
    }
  }
})


import { defineStore } from 'pinia'
import type { BillingStatus } from '~~/types/billing'

const EMPTY_STATUS: BillingStatus = {
  hasFullAccess: false,
  unlockedCourseIds: [],
  remainingFreeMocks: {}
}

export const useBillingStore = defineStore('billing', {
  state: () => ({
    status: EMPTY_STATUS as BillingStatus,
    loading: false
  }),
  getters: {
    hasAccess: (state) => (courseId: string) => state.status.hasFullAccess || state.status.unlockedCourseIds.includes(courseId),
    remainingMocks: (state) => (courseId: string, freeLimit: number) => {
      const raw = state.status.remainingFreeMocks[courseId]
      if (typeof raw === 'number') {
        return Math.max(raw, 0)
      }
      return freeLimit
    }
  },
  actions: {
    async refresh() {
      this.loading = true
      try {
        const response = await $fetch<{ ok: boolean; data: BillingStatus }>('/api/billing/status')
        if (response.ok) {
          this.status = response.data
        }
      } catch {
        this.status = { ...EMPTY_STATUS }
      } finally {
        this.loading = false
      }
    },

    async purchase(scope: 'course' | 'full', courseId?: string) {
      const response = await $fetch<{ ok: boolean; message?: string }>('/api/billing/purchase', {
        method: 'POST',
        body: { scope, courseId }
      })

      if (response.ok) {
        await this.refresh()
      }

      return response
    }
  }
})


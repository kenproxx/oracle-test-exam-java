import { defineStore } from 'pinia'
import type { AuthResponse, UserProfile } from '~~/types/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as UserProfile | null,
    initialized: false,
    loading: false
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.user)
  },
  actions: {
    async bootstrap() {
      if (this.initialized) {
        return
      }

      this.loading = true
      try {
        const response = await $fetch<AuthResponse>('/api/auth/me')
        if (response.ok && response.session?.user) {
          this.user = response.session.user
        } else {
          this.user = null
        }
      } catch {
        this.user = null
      } finally {
        this.loading = false
        this.initialized = true
      }
    },

    async login(email: string, password: string) {
      this.loading = true
      try {
        const response = await $fetch<AuthResponse>('/api/auth/login', {
          method: 'POST',
          body: { email, password }
        })

        if (response.ok && response.session?.user) {
          this.user = response.session.user
          return { ok: true }
        }

        return { ok: false, message: response.message || 'Login failed' }
      } catch (error: any) {
        return { ok: false, message: error?.data?.message || 'Login failed' }
      } finally {
        this.loading = false
        this.initialized = true
      }
    },

    async register(displayName: string, email: string, password: string) {
      this.loading = true
      try {
        const response = await $fetch<AuthResponse>('/api/auth/register', {
          method: 'POST',
          body: { displayName, email, password }
        })

        if (response.ok && response.session?.user) {
          this.user = response.session.user
          return { ok: true }
        }

        return { ok: false, message: response.message || 'Register failed' }
      } catch (error: any) {
        return { ok: false, message: error?.data?.message || 'Register failed' }
      } finally {
        this.loading = false
        this.initialized = true
      }
    },

    async logout() {
      await $fetch('/api/auth/logout', { method: 'POST' })
      this.user = null
      this.initialized = true
    }
  }
})


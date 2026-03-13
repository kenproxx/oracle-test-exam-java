import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@vueuse/nuxt', '@nuxtjs/tailwindcss', '@nuxtjs/i18n'],
  css: ['~/assets/css/tailwind.css'],
  runtimeConfig: {
    aesKey: process.env.AES_KEY,
    tokenSecret: process.env.TOKEN_SECRET,
    passThreshold: process.env.PASS_THRESHOLD,
    questionsSourceUrl: process.env.GOOGLE_SHEET_URL,
    googleAppsScriptUrl: process.env.GOOGLE_APPS_SCRIPT_URL,
    public: {
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'Oracle Java Exam Prep',
      freeMockLimit: Number(process.env.NUXT_PUBLIC_FREE_MOCK_LIMIT || 2)
    }
  },
  // @ts-expect-error injected by @nuxtjs/i18n module
  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'vi',
    lazy: true,
    langDir: '../locales',
    locales: [
      { code: 'vi', iso: 'vi-VN', file: 'vi.json', name: 'Tieng Viet' },
      { code: 'en', iso: 'en-US', file: 'en.json', name: 'English' }
    ]
  },
  typescript: {
    strict: true,
    typeCheck: false
  },
  nitro: {
    preset: 'vercel'
  }
})

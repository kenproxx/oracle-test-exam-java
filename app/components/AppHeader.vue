<template>
  <header class="border-b border-slate-200 bg-white/90 backdrop-blur">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
      <NuxtLink :to="localePath('/')" class="flex flex-col">
        <span class="text-lg font-extrabold text-slate-900">{{ t('app.title') }}</span>
        <span class="text-xs text-slate-500">{{ t('app.subtitle') }}</span>
      </NuxtLink>

      <nav class="hidden items-center gap-4 md:flex">
        <NuxtLink :to="localePath('/')" class="text-sm font-semibold text-slate-700 hover:text-brand-600">{{ t('nav.home') }}</NuxtLink>
        <NuxtLink :to="localePath('/courses')" class="text-sm font-semibold text-slate-700 hover:text-brand-600">{{ t('nav.courses') }}</NuxtLink>
        <NuxtLink :to="localePath('/history')" class="text-sm font-semibold text-slate-700 hover:text-brand-600">{{ t('nav.history') }}</NuxtLink>
        <NuxtLink :to="localePath('/pricing')" class="text-sm font-semibold text-slate-700 hover:text-brand-600">{{ t('nav.pricing') }}</NuxtLink>
      </nav>

      <div class="flex items-center gap-2">
        <button
          v-for="item in locales"
          :key="item.code"
          class="rounded-lg border px-2 py-1 text-xs font-semibold"
          :class="locale === item.code ? 'border-brand-600 text-brand-700' : 'border-slate-300 text-slate-500'"
          @click="switchLang(item.code)"
        >
          {{ item.code.toUpperCase() }}
        </button>

        <NuxtLink
          v-if="!authStore.isLoggedIn"
          :to="localePath('/login')"
          class="btn-secondary hidden text-sm sm:inline-flex"
        >
          {{ t('nav.login') }}
        </NuxtLink>

        <button
          v-else
          class="btn-secondary hidden text-sm sm:inline-flex"
          @click="handleLogout"
        >
          {{ t('nav.logout') }}
        </button>
      </div>
    </div>

    <nav class="mx-auto flex max-w-6xl items-center gap-3 overflow-x-auto px-4 pb-3 md:hidden">
      <NuxtLink :to="localePath('/')" class="text-sm font-semibold text-slate-700">{{ t('nav.home') }}</NuxtLink>
      <NuxtLink :to="localePath('/courses')" class="text-sm font-semibold text-slate-700">{{ t('nav.courses') }}</NuxtLink>
      <NuxtLink :to="localePath('/history')" class="text-sm font-semibold text-slate-700">{{ t('nav.history') }}</NuxtLink>
      <NuxtLink :to="localePath('/pricing')" class="text-sm font-semibold text-slate-700">{{ t('nav.pricing') }}</NuxtLink>
      <NuxtLink v-if="!authStore.isLoggedIn" :to="localePath('/login')" class="text-sm font-semibold text-slate-700">{{ t('nav.login') }}</NuxtLink>
      <button v-else class="text-sm font-semibold text-slate-700" @click="handleLogout">{{ t('nav.logout') }}</button>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const { t, locale, locales } = useI18n()

function switchLang(nextLocale: string) {
  navigateTo(switchLocalePath(nextLocale as 'vi' | 'en'))
}

async function handleLogout() {
  await authStore.logout()
  await navigateTo(localePath('/'))
}
</script>


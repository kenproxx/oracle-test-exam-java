<template>
  <section class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
    <div class="card">
      <p class="text-xs font-semibold uppercase tracking-widest text-brand-700">Oracle Java</p>
      <h1 class="mt-2 text-4xl font-extrabold leading-tight text-slate-900">{{ t('home.headline') }}</h1>
      <p class="mt-4 text-slate-600">{{ t('home.description') }}</p>
      <div class="mt-6 flex flex-wrap gap-3">
        <NuxtLink :to="localePath('/courses')" class="btn-primary">{{ t('home.ctaPrimary') }}</NuxtLink>
        <NuxtLink :to="localePath('/pricing')" class="btn-secondary">{{ t('home.ctaSecondary') }}</NuxtLink>
      </div>
    </div>

    <div class="card bg-slate-900 text-white">
      <p class="text-sm uppercase tracking-wider text-cyan-300">Feature</p>
      <ul class="mt-4 space-y-3 text-sm text-slate-200">
        <li>1. Practice mode with instant explanation</li>
        <li>2. Timed mock exam with pass/fail report</li>
        <li>3. Free plan: 2 mock attempts per course</li>
        <li>4. Premium unlock by course or full package</li>
        <li>5. AES-encrypted data storage with Google Sheet gateway</li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>


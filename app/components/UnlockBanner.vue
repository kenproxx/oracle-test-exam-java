<template>
  <div class="mb-4 rounded-2xl border border-amber-300 bg-amber-50 p-4">
    <p class="text-sm font-semibold text-amber-800">{{ message }}</p>
    <NuxtLink :to="localePath(`/pricing?courseId=${courseId}`)" class="mt-3 inline-flex rounded-xl bg-amber-600 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-700">
      {{ label }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
type Props = {
  courseId: string
  message: string
  label?: string
}

withDefaults(defineProps<Props>(), {
  label: 'Unlock khoa hoc'
})

const localePath = useLocalePath()
</script>


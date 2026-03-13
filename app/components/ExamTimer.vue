<template>
  <div class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
    {{ mm }}:{{ ss }}
  </div>
</template>

<script setup lang="ts">
type Props = {
  seconds: number
}

const props = defineProps<Props>()

const mm = computed(() => String(Math.floor(props.seconds / 60)).padStart(2, '0'))
const ss = computed(() => String(props.seconds % 60).padStart(2, '0'))
</script>


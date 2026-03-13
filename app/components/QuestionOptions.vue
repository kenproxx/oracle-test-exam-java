<template>
  <fieldset class="space-y-2">
    <label
      v-for="(value, key) in options"
      :key="key"
      class="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-brand-500"
      :class="selected.includes(key) ? 'border-brand-600 bg-brand-50/50' : ''"
    >
      <input
        :type="multi ? 'checkbox' : 'radio'"
        :name="`question-${name}`"
        :checked="selected.includes(key)"
        @change="toggleChoice(key)"
      >
      <span>
        <strong>{{ key }}.</strong>
        {{ value }}
      </span>
    </label>
  </fieldset>
</template>

<script setup lang="ts">
import type { OptionMap } from '~~/types/question'

type Props = {
  name: string | number
  options: OptionMap
  multi: boolean
  modelValue: string[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (event: 'update:modelValue', value: string[]): void
}>()

const selected = computed(() => props.modelValue)

function toggleChoice(choice: string) {
  if (props.multi) {
    if (selected.value.includes(choice)) {
      emit('update:modelValue', selected.value.filter((item) => item !== choice))
      return
    }

    emit('update:modelValue', [...selected.value, choice])
    return
  }

  emit('update:modelValue', [choice])
}
</script>


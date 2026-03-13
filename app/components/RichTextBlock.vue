<template>
  <div ref="rootRef" class="rich-text-block" v-html="renderedHtml" />
</template>

<script setup lang="ts">
type PrismLike = {
  highlightAllUnder: (container: Element) => void
}

type Props = {
  text?: string | null
}

const props = defineProps<Props>()
const rootRef = ref<HTMLElement | null>(null)

let prism: PrismLike | null = null
let prismLoadTask: Promise<PrismLike | null> | null = null

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function renderPlainText(segment: string) {
  const escaped = escapeHtml(segment).replaceAll('\n', '<br>')
  if (!escaped.trim()) {
    return ''
  }

  return `<p>${escaped}</p>`
}

function renderMarkdownCodeBlocks(input: string) {
  const normalized = input.replaceAll('\r\n', '\n')
  const pattern = /```([a-zA-Z0-9_-]+)?\n?([\s\S]*?)```/g

  let output = ''
  let cursor = 0
  let match: RegExpExecArray | null = null

  while ((match = pattern.exec(normalized)) !== null) {
    const [fullMatch, language = '', codeContent = ''] = match
    const start = match.index

    if (start > cursor) {
      output += renderPlainText(normalized.slice(cursor, start))
    }

    const normalizedLanguage = language.trim().toLowerCase() || 'plaintext'
    const safeLanguage = escapeHtml(normalizedLanguage)
    const safeCode = escapeHtml(codeContent.replace(/\n$/, ''))
    output += `<div class="code-block"><span class="code-language">${safeLanguage}</span><pre class="language-${safeLanguage}"><code class="language-${safeLanguage}">${safeCode}</code></pre></div>`

    cursor = start + fullMatch.length
  }

  if (cursor < normalized.length) {
    output += renderPlainText(normalized.slice(cursor))
  }

  return output
}

const renderedHtml = computed(() => renderMarkdownCodeBlocks(props.text || ''))

async function loadPrism() {
  if (!import.meta.client) {
    return null
  }

  if (prism) {
    return prism
  }

  if (prismLoadTask) {
    return prismLoadTask
  }

  prismLoadTask = (async () => {
    const module = await import('prismjs')
    await Promise.all([
      import('prismjs/components/prism-clike'),
      import('prismjs/components/prism-java'),
      import('prismjs/components/prism-json'),
      import('prismjs/components/prism-sql'),
      import('prismjs/components/prism-markup'),
      import('prismjs/components/prism-bash')
    ])

    prism = (module.default || module) as PrismLike
    return prism
  })()

  return prismLoadTask
}

async function highlightCodeBlocks() {
  if (!import.meta.client || !rootRef.value) {
    return
  }

  const instance = await loadPrism()
  await nextTick()
  instance?.highlightAllUnder(rootRef.value)
}

onMounted(() => {
  void highlightCodeBlocks()
})

watch(
  renderedHtml,
  () => {
    void highlightCodeBlocks()
  },
  { flush: 'post' }
)
</script>

<style scoped>
.rich-text-block {
  line-height: 1.6;
}

.rich-text-block :deep(p) {
  margin: 0 0 0.75rem;
}

.rich-text-block :deep(p:last-child) {
  margin-bottom: 0;
}

.rich-text-block :deep(.code-block) {
  margin: 0.75rem 0;
}

.rich-text-block :deep(.code-language) {
  display: inline-block;
  margin-bottom: 0.4rem;
  border-radius: 999px;
  background: #334155;
  color: #e2e8f0;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 0.15rem 0.5rem;
  text-transform: uppercase;
}

.rich-text-block :deep(pre) {
  margin: 0;
  overflow-x: auto;
  border-radius: 0.8rem;
  background: #111827;
  color: #e2e8f0;
  padding: 0.85rem 1rem;
}

.rich-text-block :deep(code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.82rem;
  line-height: 1.5;
  white-space: pre;
}

</style>

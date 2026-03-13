import type { QuestionItem } from '~~/types/question'

const MASTER_KEY_STORAGE = 'questions:session:master:v1'
const CACHE_PREFIX = 'questions:session:enc:v1:'
const KEY_DERIVATION_INFO = 'oracle-java-questions'
const CACHE_TTL_MS = 1000 * 60 * 60 * 6

type EncryptedPayload = {
  v: 1
  iv: string
  salt: string
  data: string
  zip: 'gzip' | 'none'
  updatedAt: number
}

const encoder = new TextEncoder()
const decoder = new TextDecoder()

function toBase64(bytes: Uint8Array) {
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

function fromBase64(value: string) {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

function randomBytes(length: number) {
  const output = new Uint8Array(length)
  crypto.getRandomValues(output)
  return output
}

function storageKey(cacheKey: string) {
  return `${CACHE_PREFIX}${cacheKey}`
}

function resolveCacheKeys() {
  const keys: string[] = []
  for (let i = 0; i < sessionStorage.length; i += 1) {
    const key = sessionStorage.key(i)
    if (key?.startsWith(CACHE_PREFIX)) {
      keys.push(key)
    }
  }
  return keys
}

function safeSetCacheItem(cacheKey: string, value: string) {
  const key = storageKey(cacheKey)
  try {
    sessionStorage.setItem(key, value)
    return
  } catch {
    // Retry after removing older cache entries when quota is full.
  }

  const backup = value
  sessionStorage.removeItem(key)
  try {
    sessionStorage.setItem(key, backup)
    return
  } catch {
    // Continue with eviction fallback.
  }

  const evictableKeys = resolveCacheKeys()
    .filter((item) => item !== key)
    .map((item) => {
      try {
        const payload = JSON.parse(sessionStorage.getItem(item) || '{}') as Partial<EncryptedPayload>
        return { key: item, updatedAt: Number(payload.updatedAt || 0) }
      } catch {
        return { key: item, updatedAt: 0 }
      }
    })
    .sort((a, b) => a.updatedAt - b.updatedAt)

  for (const candidate of evictableKeys) {
    sessionStorage.removeItem(candidate.key)
    try {
      sessionStorage.setItem(key, backup)
      return
    } catch {
      // Keep trying until there is enough room.
    }
  }
}

function getMasterSecret() {
  const existing = sessionStorage.getItem(MASTER_KEY_STORAGE)
  if (existing) {
    return fromBase64(existing)
  }

  const secret = randomBytes(32)
  sessionStorage.setItem(MASTER_KEY_STORAGE, toBase64(secret))
  return secret
}

async function deriveEntryKey(masterSecret: Uint8Array, salt: Uint8Array) {
  const material = await crypto.subtle.importKey('raw', masterSecret as BufferSource, 'HKDF', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: salt as BufferSource,
      info: encoder.encode(KEY_DERIVATION_INFO)
    },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

async function compressBytes(input: Uint8Array) {
  if (!import.meta.client || typeof (window as any).CompressionStream === 'undefined') {
    return { bytes: input, zip: 'none' as const }
  }

  try {
    const stream = new (window as any).CompressionStream('gzip')
    const writer = stream.writable.getWriter()
    await writer.write(input)
    await writer.close()
    const compressed = await new Response(stream.readable).arrayBuffer()
    return { bytes: new Uint8Array(compressed), zip: 'gzip' as const }
  } catch {
    return { bytes: input, zip: 'none' as const }
  }
}

async function decompressBytes(input: Uint8Array, zip: 'gzip' | 'none') {
  if (zip === 'none' || !import.meta.client || typeof (window as any).DecompressionStream === 'undefined') {
    return input
  }

  try {
    const stream = new (window as any).DecompressionStream('gzip')
    const writer = stream.writable.getWriter()
    await writer.write(input)
    await writer.close()
    const decompressed = await new Response(stream.readable).arrayBuffer()
    return new Uint8Array(decompressed)
  } catch {
    return input
  }
}

export async function readEncryptedQuestions(cacheKey: string): Promise<QuestionItem[] | null> {
  if (!import.meta.client) {
    return null
  }

  try {
    const raw = sessionStorage.getItem(storageKey(cacheKey))
    if (!raw) {
      return null
    }

    const payload = JSON.parse(raw) as EncryptedPayload
    if (!payload?.data || !payload?.iv || !payload?.salt || payload.v !== 1) {
      sessionStorage.removeItem(storageKey(cacheKey))
      return null
    }

    if (Date.now() - payload.updatedAt > CACHE_TTL_MS) {
      sessionStorage.removeItem(storageKey(cacheKey))
      return null
    }

    const key = await deriveEntryKey(getMasterSecret(), fromBase64(payload.salt))
    const plainBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: fromBase64(payload.iv) as BufferSource },
      key,
      fromBase64(payload.data) as BufferSource
    )

    const plainBytes = await decompressBytes(new Uint8Array(plainBuffer), payload.zip || 'none')
    const json = decoder.decode(plainBytes)
    return JSON.parse(json) as QuestionItem[]
  } catch {
    sessionStorage.removeItem(storageKey(cacheKey))
    return null
  }
}

export async function writeEncryptedQuestions(cacheKey: string, questions: QuestionItem[]) {
  if (!import.meta.client) {
    return
  }

  try {
    const salt = randomBytes(16)
    const iv = randomBytes(12)
    const key = await deriveEntryKey(getMasterSecret(), salt)
    const plain = encoder.encode(JSON.stringify(questions))
    const compressed = await compressBytes(plain)
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as BufferSource }, key, compressed.bytes as BufferSource)

    const payload: EncryptedPayload = {
      v: 1,
      salt: toBase64(salt),
      iv: toBase64(iv),
      data: toBase64(new Uint8Array(encrypted)),
      zip: compressed.zip,
      updatedAt: Date.now()
    }

    safeSetCacheItem(cacheKey, JSON.stringify(payload))
  } catch {
    // Skip caching on encryption/storage failures.
  }
}

export function hasEncryptedQuestions(cacheKey: string) {
  if (!import.meta.client) {
    return false
  }

  return Boolean(sessionStorage.getItem(storageKey(cacheKey)))
}

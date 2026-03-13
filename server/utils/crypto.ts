import { createHash, randomBytes, webcrypto } from 'node:crypto'
import { createError } from 'h3'

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()
let cachedKey: CryptoKey | null = null

function getRawSecret() {
  const config = useRuntimeConfig()
  const secret = config.aesKey
  if (!secret) {
    throw createError({ statusCode: 500, message: 'Missing AES_KEY runtime config' })
  }
  return secret
}

async function getAesKey() {
  if (cachedKey) {
    return cachedKey
  }

  const secret = getRawSecret()
  const digest = createHash('sha256').update(secret).digest()
  cachedKey = await webcrypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['encrypt', 'decrypt'])
  return cachedKey
}

export async function encryptPayload(payload: unknown) {
  const key = await getAesKey()
  const iv = randomBytes(12)
  const plaintext = textEncoder.encode(JSON.stringify(payload))
  const encrypted = await webcrypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext)

  return Buffer.concat([iv, Buffer.from(encrypted)]).toString('base64')
}

export async function decryptPayload<T>(cipherTextBase64: string) {
  const key = await getAesKey()
  const raw = Buffer.from(cipherTextBase64, 'base64')
  const iv = raw.subarray(0, 12)
  const encrypted = raw.subarray(12)
  const decrypted = await webcrypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted)

  return JSON.parse(textDecoder.decode(decrypted)) as T
}

export function hashLookupValue(value: string) {
  return createHash('sha256').update(`${getRawSecret()}::${value}`).digest('hex')
}

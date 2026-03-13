import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { getCookie, setCookie, deleteCookie, H3Event } from 'h3'

type TokenPayload = {
  userId: string
  email: string
  role: 'free' | 'premium'
  exp: number
}

function getTokenSecret() {
  const config = useRuntimeConfig()
  return config.tokenSecret || config.aesKey || 'dev-token-secret'
}

function toBase64(input: string) {
  return Buffer.from(input).toString('base64url')
}

function fromBase64<T>(input: string) {
  return JSON.parse(Buffer.from(input, 'base64url').toString('utf-8')) as T
}

function sign(data: string) {
  return createHmac('sha256', getTokenSecret()).update(data).digest('base64url')
}

export function createSessionToken(input: Omit<TokenPayload, 'exp'>, expiresInSeconds = 60 * 60 * 24 * 14) {
  const payload: TokenPayload = {
    ...input,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds
  }

  const encodedPayload = toBase64(JSON.stringify(payload))
  const signature = sign(encodedPayload)
  return `${encodedPayload}.${signature}`
}

export function verifySessionToken(token?: string | null) {
  if (!token) {
    return null
  }

  const [encodedPayload, signature] = token.split('.')
  if (!encodedPayload || !signature) {
    return null
  }

  const expected = sign(encodedPayload)
  const expectedBuffer = Buffer.from(expected)
  const signatureBuffer = Buffer.from(signature)

  if (expectedBuffer.length !== signatureBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null
  }

  const payload = fromBase64<TokenPayload>(encodedPayload)
  if (payload.exp < Math.floor(Date.now() / 1000)) {
    return null
  }

  return payload
}

export function setAuthTokenCookie(event: H3Event, token: string) {
  setCookie(event, 'oracle_exam_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 14
  })
}

export function clearAuthTokenCookie(event: H3Event) {
  deleteCookie(event, 'oracle_exam_token', { path: '/' })
}

export function getAuthTokenFromCookie(event: H3Event) {
  return getCookie(event, 'oracle_exam_token')
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, getTokenSecret() + salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(':')
  if (!salt || !hash) {
    return false
  }

  const computed = scryptSync(password, getTokenSecret() + salt, 64).toString('hex')
  const computedBuffer = Buffer.from(computed)
  const hashBuffer = Buffer.from(hash)
  return computedBuffer.length === hashBuffer.length && timingSafeEqual(hashBuffer, computedBuffer)
}

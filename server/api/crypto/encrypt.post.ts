import { z } from 'zod'
import { requireUser } from '~~/server/utils/session'
import { encryptPayload } from '~~/server/utils/crypto'

const bodySchema = z.object({
  payload: z.unknown()
})

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const body = bodySchema.parse(await readBody(event))

  const cipher = await encryptPayload(body.payload)

  return {
    ok: true,
    data: { cipher }
  }
})

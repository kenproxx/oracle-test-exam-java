import { z } from 'zod'
import { requireUser } from '~~/server/utils/session'
import { decryptPayload } from '~~/server/utils/crypto'

const bodySchema = z.object({
  cipher: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const body = bodySchema.parse(await readBody(event))

  const payload = await decryptPayload(body.cipher)

  return {
    ok: true,
    data: { payload }
  }
})

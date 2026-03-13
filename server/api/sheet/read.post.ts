import { z } from 'zod'
import { requireUser } from '~~/server/utils/session'
import { readTable } from '~~/server/utils/sheetGateway'

const bodySchema = z.object({
  table: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const body = bodySchema.parse(await readBody(event))
  const rows = await readTable(body.table)

  return {
    ok: true,
    data: rows
  }
})

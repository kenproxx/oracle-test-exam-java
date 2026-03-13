import { z } from 'zod'
import { requireUser } from '~~/server/utils/session'
import { writeTable } from '~~/server/utils/sheetGateway'

const bodySchema = z.object({
  table: z.string().min(1),
  rows: z.array(z.record(z.string(), z.unknown()))
})

export default defineEventHandler(async (event) => {
  await requireUser(event)
  const body = bodySchema.parse(await readBody(event))

  await writeTable(body.table, body.rows)

  return {
    ok: true
  }
})

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

type SheetRow = Record<string, unknown>
type SheetPayload = {
  ok: boolean
  rows: SheetRow[]
}

type LocalTables = Record<string, SheetRow[]>

const LOCAL_STORE_PATH = join(process.cwd(), '.data', 'sheet-local.json')

async function readLocalStore() {
  try {
    const raw = await readFile(LOCAL_STORE_PATH, 'utf-8')
    return JSON.parse(raw) as LocalTables
  } catch {
    return {}
  }
}

async function writeLocalStore(store: LocalTables) {
  await mkdir(join(process.cwd(), '.data'), { recursive: true })
  await writeFile(LOCAL_STORE_PATH, JSON.stringify(store, null, 2), 'utf-8')
}

async function callAppsScript(action: 'read' | 'write', table: string, rows?: SheetRow[]) {
  const config = useRuntimeConfig()
  if (!config.googleAppsScriptUrl) {
    return null
  }

  const response = await $fetch<SheetPayload>(config.googleAppsScriptUrl, {
    method: 'POST',
    body: {
      action,
      table,
      rows: rows || []
    }
  })

  return response
}

export async function readTable(table: string) {
  const remote = await callAppsScript('read', table)
  if (remote?.ok) {
    return remote.rows
  }

  const local = await readLocalStore()
  return local[table] || []
}

export async function writeTable(table: string, rows: SheetRow[]) {
  const remote = await callAppsScript('write', table, rows)
  if (remote?.ok) {
    return
  }

  const local = await readLocalStore()
  local[table] = rows
  await writeLocalStore(local)
}

export async function appendTableRow(table: string, row: SheetRow) {
  const rows = await readTable(table)
  rows.push(row)
  await writeTable(table, rows)
}

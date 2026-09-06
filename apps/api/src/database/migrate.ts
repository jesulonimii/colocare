import { promises as fs } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { FileMigrationProvider, Migrator } from "kysely"
import { db } from "./index.js"

const migrationFolder = path.join(path.dirname(fileURLToPath(import.meta.url)), "migrations")
const migrator = new Migrator({ db, provider: new FileMigrationProvider({ fs, path, migrationFolder }) })
const { error, results } = await migrator.migrateToLatest()

for (const result of results ?? []) {
	console.log(`${result.migrationName}: ${result.status}`)
}
await db.destroy()

if (error) throw error

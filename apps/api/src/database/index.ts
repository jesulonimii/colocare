import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely"
import pg from "pg"
import type { DB } from "./db.types.js"

export type Database = DB
export const db = new Kysely<Database>({
	dialect: new PostgresDialect({ pool: new pg.Pool({ connectionString: process.env.DATABASE_URL }) }),
	plugins: [new CamelCasePlugin()],
})

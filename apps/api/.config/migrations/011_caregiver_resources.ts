import { type Kysely, sql } from "kysely"
import type { Database } from "../../src/database/index.js"

export async function up(db: Kysely<Database>) {
	await db.schema
		.createTable("caregiver_resources")
		.addColumn("id", "uuid", (column) => column.primaryKey())
		.addColumn("caregiver_id", "uuid", (column) => column.references("users.id").onDelete("cascade").notNull())
		.addColumn("category", "varchar(80)", (column) => column.notNull())
		.addColumn("title", "varchar(160)", (column) => column.notNull())
		.addColumn("summary", "text", (column) => column.notNull())
		.addColumn("read_time", "varchar(40)", (column) => column.defaultTo("2 min read").notNull())
		.addColumn("created_at", "timestamptz", (column) => column.defaultTo(sql`now()`).notNull())
		.execute()
}

export async function down(db: Kysely<Database>) {
	await db.schema.dropTable("caregiver_resources").ifExists().execute()
}

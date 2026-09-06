import { type Kysely, sql } from "kysely"
import type { Database } from "../../src/database/index.js"

export async function up(db: Kysely<Database>) {
	await db.schema
		.createTable("goals")
		.addColumn("id", "uuid", (column) => column.primaryKey())
		.addColumn("userId", "uuid", (column) => column.references("users.id").onDelete("cascade").notNull())
		.addColumn("title", "varchar(120)", (column) => column.notNull())
		.addColumn("category", "varchar(20)", (column) => column.notNull())
		.addColumn("completed", "boolean", (column) => column.defaultTo(false).notNull())
		.addColumn("createdAt", "timestamptz", (column) => column.defaultTo(sql`now()`).notNull())
		.execute()
}
export async function down(db: Kysely<Database>) {
	await db.schema.dropTable("goals").ifExists().execute()
}

import { type Kysely, sql } from "kysely"
import type { Database } from "../index.js"

export async function up(db: Kysely<Database>) {
	await db.schema
		.createTable("caregiver_support_tasks")
		.addColumn("id", "uuid", (column) => column.primaryKey())
		.addColumn("caregiver_id", "uuid", (column) => column.references("users.id").onDelete("cascade").notNull())
		.addColumn("patient_id", "uuid", (column) => column.references("users.id").onDelete("cascade").notNull())
		.addColumn("title", "varchar(160)", (column) => column.notNull())
		.addColumn("completed", "boolean", (column) => column.defaultTo(false).notNull())
		.addColumn("created_at", "timestamptz", (column) => column.defaultTo(sql`now()`).notNull())
		.addColumn("updated_at", "timestamptz", (column) => column.defaultTo(sql`now()`).notNull())
		.execute()
	await db.schema
		.createTable("caregiver_notes")
		.addColumn("id", "uuid", (column) => column.primaryKey())
		.addColumn("caregiver_id", "uuid", (column) => column.references("users.id").onDelete("cascade").notNull())
		.addColumn("patient_id", "uuid", (column) => column.references("users.id").onDelete("cascade").notNull())
		.addColumn("body", "text", (column) => column.notNull())
		.addColumn("created_at", "timestamptz", (column) => column.defaultTo(sql`now()`).notNull())
		.execute()
}

export async function down(db: Kysely<Database>) {
	await db.schema.dropTable("caregiver_notes").ifExists().execute()
	await db.schema.dropTable("caregiver_support_tasks").ifExists().execute()
}

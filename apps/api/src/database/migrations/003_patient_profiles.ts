import { type Kysely, sql } from "kysely"
import type { Database } from "../index.js"

export async function up(db: Kysely<Database>) {
	await db.schema
		.createTable("patient_profiles")
		.addColumn("id", "uuid", (column) => column.primaryKey())
		.addColumn("user_id", "uuid", (column) => column.references("users.id").onDelete("cascade").unique().notNull())
		.addColumn("date_of_birth", "date", (column) => column.notNull())
		.addColumn("sex", "varchar(30)", (column) => column.notNull())
		.addColumn("treatment_status", "varchar(40)", (column) => column.notNull())
		.addColumn("treatment_history", "jsonb", (column) => column.notNull())
		.addColumn("survivorship_symptoms", "jsonb", (column) => column.notNull())
		.addColumn("consent_given", "boolean", (column) => column.notNull())
		.addColumn("created_at", "timestamptz", (column) => column.defaultTo(sql`now()`).notNull())
		.addColumn("updated_at", "timestamptz", (column) => column.defaultTo(sql`now()`).notNull())
		.execute()
}

export async function down(db: Kysely<Database>) {
	await db.schema.dropTable("patient_profiles").ifExists().execute()
}

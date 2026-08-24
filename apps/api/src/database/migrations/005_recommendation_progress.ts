import { type Kysely, sql } from "kysely"
import type { Database } from "../index.js"

export async function up(db: Kysely<Database>) {
	await db.schema
		.createTable("recommendation_progress")
		.addColumn("id", "uuid", (column) => column.primaryKey())
		.addColumn("user_id", "uuid", (column) => column.references("users.id").onDelete("cascade").notNull())
		.addColumn("recommendation_id", "varchar(80)", (column) => column.notNull())
		.addColumn("completed", "boolean", (column) => column.defaultTo(false).notNull())
		.addColumn("created_at", "timestamptz", (column) => column.defaultTo(sql`now()`).notNull())
		.addColumn("updated_at", "timestamptz", (column) => column.defaultTo(sql`now()`).notNull())
		.addUniqueConstraint("recommendation_progress_user_recommendation_key", ["user_id", "recommendation_id"])
		.execute()
}

export async function down(db: Kysely<Database>) {
	await db.schema.dropTable("recommendation_progress").ifExists().execute()
}

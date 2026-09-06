import type { Kysely } from "kysely"
import type { Database } from "../../src/database/index.js"

export async function up(db: Kysely<Database>) {
	await db.schema
		.alterTable("weekly_achievements")
		.addColumn("skipped_actions", "integer", (column) => column.defaultTo(0).notNull())
		.execute()
}

export async function down(db: Kysely<Database>) {
	await db.schema.alterTable("weekly_achievements").dropColumn("skipped_actions").execute()
}

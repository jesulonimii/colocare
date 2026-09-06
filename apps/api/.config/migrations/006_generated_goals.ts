import { type Kysely, sql } from "kysely"
import type { Database } from "../../src/database/index.js"

export async function up(db: Kysely<Database>) {
	await db.schema.alterTable("goals").addColumn("generated_goal_key", "varchar(160)").execute()
	await sql`ALTER TABLE goals ADD CONSTRAINT goals_user_generated_goal_key UNIQUE (user_id, generated_goal_key)`.execute(
		db
	)
}

export async function down(db: Kysely<Database>) {
	await sql`ALTER TABLE goals DROP CONSTRAINT goals_user_generated_goal_key`.execute(db)
	await db.schema.alterTable("goals").dropColumn("generated_goal_key").execute()
}

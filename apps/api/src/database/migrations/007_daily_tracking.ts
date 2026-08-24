import { type Kysely, sql } from "kysely"
import type { Database } from "../index.js"

export async function up(db: Kysely<Database>) {
	await db.schema
		.createTable("daily_assessments")
		.addColumn("id", "uuid", (column) => column.primaryKey())
		.addColumn("user_id", "uuid", (column) => column.references("users.id").onDelete("cascade").notNull())
		.addColumn("log_date", "date", (column) => column.notNull())
		.addColumn("data", "jsonb", (column) => column.notNull())
		.addColumn("created_at", "timestamptz", (column) => column.defaultTo(sql`now()`).notNull())
		.addColumn("updated_at", "timestamptz", (column) => column.defaultTo(sql`now()`).notNull())
		.addUniqueConstraint("daily_assessments_user_date_key", ["user_id", "log_date"])
		.execute()
	await db.schema
		.createTable("daily_action_logs")
		.addColumn("id", "uuid", (column) => column.primaryKey())
		.addColumn("user_id", "uuid", (column) => column.references("users.id").onDelete("cascade").notNull())
		.addColumn("goal_id", "uuid", (column) => column.references("goals.id").onDelete("cascade").notNull())
		.addColumn("action_date", "date", (column) => column.notNull())
		.addColumn("completed", "boolean", (column) => column.defaultTo(false).notNull())
		.addColumn("updated_at", "timestamptz", (column) => column.defaultTo(sql`now()`).notNull())
		.addUniqueConstraint("daily_action_logs_user_goal_date_key", ["user_id", "goal_id", "action_date"])
		.execute()
	await db.schema
		.createTable("weekly_achievements")
		.addColumn("id", "uuid", (column) => column.primaryKey())
		.addColumn("user_id", "uuid", (column) => column.references("users.id").onDelete("cascade").notNull())
		.addColumn("week_start", "date", (column) => column.notNull())
		.addColumn("logged_days", "integer", (column) => column.notNull())
		.addColumn("completed_actions", "integer", (column) => column.notNull())
		.addColumn("total_actions", "integer", (column) => column.notNull())
		.addColumn("score", "integer", (column) => column.notNull())
		.addColumn("created_at", "timestamptz", (column) => column.defaultTo(sql`now()`).notNull())
		.addColumn("updated_at", "timestamptz", (column) => column.defaultTo(sql`now()`).notNull())
		.addUniqueConstraint("weekly_achievements_user_week_key", ["user_id", "week_start"])
		.execute()
}

export async function down(db: Kysely<Database>) {
	await db.schema.dropTable("weekly_achievements").ifExists().execute()
	await db.schema.dropTable("daily_action_logs").ifExists().execute()
	await db.schema.dropTable("daily_assessments").ifExists().execute()
}

import { type Kysely, sql } from "kysely"
import type { Database } from "../index.js"

export async function up(db: Kysely<Database>) {
	await db.schema
		.createTable("weekly_plans")
		.addColumn("id", "uuid", (column) => column.primaryKey())
		.addColumn("user_id", "uuid", (column) => column.references("users.id").onDelete("cascade").notNull())
		.addColumn("week_start", "date", (column) => column.notNull())
		.addColumn("source", "varchar(20)", (column) => column.notNull())
		.addColumn("items", "jsonb", (column) => column.notNull())
		.addColumn("model_version", "varchar(80)", (column) => column.notNull())
		.addColumn("reason", "text", (column) => column.notNull())
		.addColumn("created_at", "timestamptz", (column) => column.defaultTo(sql`now()`).notNull())
		.addColumn("updated_at", "timestamptz", (column) => column.defaultTo(sql`now()`).notNull())
		.addUniqueConstraint("weekly_plans_user_week_key", ["user_id", "week_start"])
		.execute()
	await db.schema
		.createTable("weekly_plan_action_logs")
		.addColumn("id", "uuid", (column) => column.primaryKey())
		.addColumn("user_id", "uuid", (column) => column.references("users.id").onDelete("cascade").notNull())
		.addColumn("weekly_plan_id", "uuid", (column) =>
			column.references("weekly_plans.id").onDelete("cascade").notNull()
		)
		.addColumn("action_key", "varchar(160)", (column) => column.notNull())
		.addColumn("action_date", "date", (column) => column.notNull())
		.addColumn("status", "varchar(20)", (column) => column.defaultTo("open").notNull())
		.addColumn("updated_at", "timestamptz", (column) => column.defaultTo(sql`now()`).notNull())
		.addUniqueConstraint("weekly_plan_action_logs_user_action_date_key", [
			"user_id",
			"weekly_plan_id",
			"action_key",
			"action_date",
		])
		.execute()
}

export async function down(db: Kysely<Database>) {
	await db.schema.dropTable("weekly_plan_action_logs").ifExists().execute()
	await db.schema.dropTable("weekly_plans").ifExists().execute()
}

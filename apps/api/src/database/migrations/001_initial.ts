import { type Kysely, sql } from "kysely"
import type { Database } from "../index.js"

export async function up(db: Kysely<Database>) {
	await db.schema
		.createTable("users")
		.ifNotExists()
		.addColumn("id", "uuid", (column) => column.primaryKey())
		.addColumn("name", "varchar(80)", (column) => column.notNull())
		.addColumn("email", "varchar(255)", (column) => column.notNull().unique())
		.addColumn("passwordHash", "text", (column) => column.notNull())
		.addColumn("role", "varchar(20)", (column) => column.notNull())
		.addColumn("createdAt", "timestamptz", (column) => column.defaultTo(sql`now()`).notNull())
		.execute()
	await db.schema
		.createTable("assessments")
		.ifNotExists()
		.addColumn("id", "uuid", (column) => column.primaryKey())
		.addColumn("userId", "uuid", (column) => column.references("users.id").onDelete("cascade").notNull())
		.addColumn("data", "jsonb", (column) => column.notNull())
		.addColumn("createdAt", "timestamptz", (column) => column.defaultTo(sql`now()`).notNull())
		.execute()
	await db.schema
		.createTable("recommendations")
		.ifNotExists()
		.addColumn("id", "uuid", (column) => column.primaryKey())
		.addColumn("userId", "uuid", (column) => column.references("users.id").onDelete("cascade").notNull())
		.addColumn("items", "jsonb", (column) => column.notNull())
		.addColumn("modelVersion", "varchar(80)", (column) => column.notNull())
		.addColumn("createdAt", "timestamptz", (column) => column.defaultTo(sql`now()`).notNull())
		.execute()
}

export async function down(db: Kysely<Database>) {
	await db.schema.dropTable("recommendations").ifExists().execute()
	await db.schema.dropTable("assessments").ifExists().execute()
	await db.schema.dropTable("users").ifExists().execute()
}

import type { Kysely } from "kysely"
import type { Database } from "../../src/database/index.js"

export async function up(db: Kysely<Database>) {
	await db.schema
		.alterTable("patient_profiles")
		.addColumn("disease_stage", "varchar(30)")
		.addColumn("tumor_location", "varchar(30)")
		.addColumn("surgery_performed", "boolean")
		.addColumn("chemotherapy_received", "boolean")
		.addColumn("chemotherapy_cycles", "integer")
		.addColumn("chemotherapy_timing", "varchar(30)")
		.addColumn("radiotherapy_received", "boolean")
		.execute()
}

export async function down(db: Kysely<Database>) {
	await db.schema
		.alterTable("patient_profiles")
		.dropColumn("radiotherapy_received")
		.dropColumn("chemotherapy_timing")
		.dropColumn("chemotherapy_cycles")
		.dropColumn("chemotherapy_received")
		.dropColumn("surgery_performed")
		.dropColumn("tumor_location")
		.dropColumn("disease_stage")
		.execute()
}

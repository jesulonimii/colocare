import { type Kysely, sql } from "kysely"
import type { Database } from "../../src/database/index.js"

export async function up(db: Kysely<Database>) {
	await sql`ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('pending', 'oncologist', 'caregiver', 'patient', 'relative'))`.execute(
		db
	)
}
export async function down(db: Kysely<Database>) {
	await sql`ALTER TABLE users DROP CONSTRAINT users_role_check`.execute(db)
	await sql`ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('oncologist', 'caregiver', 'patient', 'relative'))`.execute(
		db
	)
}

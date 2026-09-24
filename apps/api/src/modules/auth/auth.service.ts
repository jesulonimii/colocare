import { randomUUID } from "node:crypto"
import argon2 from "argon2"
import { sql } from "kysely"
import type { Json } from "../../database/db.types.js"
import { db } from "../../database/index.js"
import { createStarterPlan } from "../wellness/wellness.service.js"
import type { AuthDto } from "./auth.dto.js"

export type UserRole = "pending" | "oncologist" | "caregiver" | "patient" | "relative"
export type AuthUser = { id: string; name: string; email: string; role: UserRole }
const mapUser = (row: { id: string; name: string; email: string; role: string }): AuthUser => ({
	id: row.id,
	name: row.name,
	email: row.email,
	role: row.role as UserRole,
})

export async function signup(data: AuthDto["signup"]) {
	const row = await db
		.insertInto("users")
		.values({
			id: randomUUID(),
			name: data.name.trim(),
			email: data.email.toLowerCase(),
			passwordHash: await argon2.hash(data.password),
			role: "pending",
		})
		.returning(["id", "name", "email", "role"])
		.executeTakeFirstOrThrow()
	return mapUser(row)
}
export async function completeOnboarding(userId: string, data: AuthDto["onboarding"]) {
	const user = await db.transaction().execute(async (trx) => {
		const row = await trx
			.updateTable("users")
			.set({ role: data.role })
			.where("id", "=", userId)
			.returning(["id", "name", "email", "role"])
			.executeTakeFirst()
		if (!row) return null
		const existingProfile = await trx
			.selectFrom("patientProfiles")
			.select("id")
			.where("userId", "=", userId)
			.executeTakeFirst()
		if (data.patientProfile && !existingProfile)
			await trx
				.insertInto("patientProfiles")
				.values({
					id: randomUUID(),
					userId,
					dateOfBirth: data.patientProfile.dateOfBirth,
					sex: data.patientProfile.sex,
					treatmentStatus: data.patientProfile.treatmentStatus,
					diseaseStage: data.patientProfile.diseaseStage,
					tumorLocation: data.patientProfile.tumorLocation,
					surgeryPerformed: data.patientProfile.surgeryPerformed,
					chemotherapyReceived: data.patientProfile.chemotherapyReceived,
					chemotherapyCycles: data.patientProfile.chemotherapyCycles,
					chemotherapyTiming: data.patientProfile.chemotherapyTiming,
					radiotherapyReceived: data.patientProfile.radiotherapyReceived,
					treatmentHistory: sql<Json>`cast(${JSON.stringify(data.patientProfile.treatmentHistory)} as jsonb)`,
					survivorshipSymptoms: sql<Json>`cast(${JSON.stringify(data.patientProfile.survivorshipSymptoms)} as jsonb)`,
					consentGiven: data.patientProfile.consentGiven,
				})
				.execute()
		return mapUser(row)
	})
	if (user && (user.role === "patient" || user.role === "relative")) await createStarterPlan(userId)
	return user
}
export async function login(data: AuthDto["login"]) {
	const row = await db
		.selectFrom("users")
		.selectAll()
		.where("email", "=", data.email.toLowerCase())
		.executeTakeFirst()
	if (!row || !(await argon2.verify(row.passwordHash, data.password))) return null
	return mapUser(row)
}
export async function getUser(id: string) {
	const row = await db
		.selectFrom("users")
		.select(["id", "name", "email", "role"])
		.where("id", "=", id)
		.executeTakeFirst()
	return row ? mapUser(row) : null
}

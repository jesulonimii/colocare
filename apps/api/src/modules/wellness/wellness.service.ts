import { randomUUID } from "node:crypto"
import { sql } from "kysely"
import type { AuthContext } from "../../auth.js"
import type { Json } from "../../database/db.types.js"
import { db } from "../../database/index.js"
import { queueWeeklyAchievement, queueWeeklyPlan } from "./achievement.queue.js"
import type { WellnessDto } from "./wellness.dto.js"

const resources = [
	{
		id: "nutrition",
		category: "Nutrition",
		title: "Eating well after colorectal cancer treatment",
		readTime: "5 min read",
		summary: "Practical ideas for balanced meals when appetite or bowel habits change.",
	},
	{
		id: "bowel",
		category: "Bowel comfort",
		title: "Managing bowel changes",
		readTime: "4 min read",
		summary: "A gentle guide to noticing patterns and preparing questions for your care team.",
	},
]
const asDate = (value: string) => new Date(`${value}T00:00:00.000Z`)
const dateKey = (value: Date | string) => (value instanceof Date ? value.toISOString().slice(0, 10) : value)
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(new Date())
const startOfWeek = (date = today()) => {
	const value = new Date(`${date}T12:00:00Z`)
	value.setUTCDate(value.getUTCDate() - ((value.getUTCDay() + 6) % 7))
	return value.toISOString().slice(0, 10)
}
type GeneratedGoal = { id: string; title: string; category: string }
type GeneratedRecommendation = {
	id: string
	category: string
	title: string
	detail: string
	tone?: "green" | "amber" | "blue"
	goals?: GeneratedGoal[]
}
type GeneratedPlan = {
	modelVersion: string
	items: GeneratedRecommendation[]
	reason?: string
	triage?: "urgent" | "routine"
	progression?: "progress" | "maintain" | "ease"
}
const RED_FLAGS = new Set(["Blood in stool", "Unexplained weight loss", "Persistent bloating"])
const urgentPlan = (symptoms: string[]): GeneratedPlan => ({
	modelVersion: "safety-screen-v1",
	items: [],
	reason: `You reported ${symptoms.filter((symptom) => RED_FLAGS.has(symptom)).join(", ")}. Contact your oncology care team or seek urgent care now.`,
	triage: "urgent",
})

async function modelPlan(
	assessment: WellnessDto["assessment"],
	profile?: Record<string, unknown>,
	history?: Record<string, number>,
	starter = false
) {
	const response = await fetch(
		`${process.env.RECOMMENDER_URL ?? "http://localhost:8000"}${starter ? "/starter-plan" : "/recommend"}`,
		starter
			? undefined
			: {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({ profile, assessment, history }),
				}
	)
	if (!response.ok) throw new Error("Recommendation service unavailable")
	return coachPlan((await response.json()) as GeneratedPlan)
}
function coachPlan(plan: GeneratedPlan): GeneratedPlan {
	if (plan.progression === "maintain" || !plan.progression) return plan
	const minutes = plan.progression === "progress" ? 15 : 5
	return {
		...plan,
		items: plan.items.map((item) =>
			item.id !== "movement"
				? item
				: {
						...item,
						goals: (item.goals ?? []).map((goal) => ({
							...goal,
							title: goal.title.replace(/\d+-minute/, `${minutes}-minute`),
						})),
					}
		),
	}
}
async function insertPlan(userId: string, weekStart: string, source: "starter" | "model", plan: GeneratedPlan) {
	const row = await db
		.insertInto("weeklyPlans")
		.values({
			id: randomUUID(),
			userId,
			weekStart: asDate(weekStart),
			source,
			items: sql<Json>`cast(${JSON.stringify(plan.items)} as jsonb)`,
			modelVersion: plan.modelVersion,
			reason: plan.reason ?? "Based on the wellbeing patterns from your recent daily check-ins.",
		})
		.onConflict((conflict) =>
			conflict.columns(["userId", "weekStart"]).doUpdateSet({
				source,
				items: sql<Json>`cast(${JSON.stringify(plan.items)} as jsonb)`,
				modelVersion: plan.modelVersion,
				reason: plan.reason ?? "Based on the wellbeing patterns from your recent daily check-ins.",
				updatedAt: sql`now()`,
			})
		)
		.returning("id")
		.executeTakeFirst()
	return row?.id ?? null
}
export async function createStarterPlan(userId: string) {
	const profile = await patientProfile(userId)
	const symptoms = (profile?.survivorshipSymptoms as string[] | undefined) ?? []
	const plan = symptoms.some((symptom) => RED_FLAGS.has(symptom))
		? urgentPlan(symptoms)
		: await modelPlan({} as WellnessDto["assessment"], undefined, undefined, true)
	return insertPlan(userId, startOfWeek(), "starter", plan)
}
const patientProfile = (userId: string) =>
	db
		.selectFrom("patientProfiles")
		.select([
			"dateOfBirth",
			"sex",
			"treatmentStatus",
			"diseaseStage",
			"tumorLocation",
			"surgeryPerformed",
			"chemotherapyReceived",
			"chemotherapyCycles",
			"chemotherapyTiming",
			"radiotherapyReceived",
			"survivorshipSymptoms",
		])
		.where("userId", "=", userId)
		.executeTakeFirst()
const asModelProfile = (profile: Awaited<ReturnType<typeof patientProfile>>): Record<string, unknown> => ({
	diseaseStage: profile?.diseaseStage ?? "Unknown",
	tumorLocation: profile?.tumorLocation ?? "Unknown",
	surgeryPerformed: profile?.surgeryPerformed ?? false,
	chemotherapyReceived: profile?.chemotherapyReceived ?? false,
	chemotherapyCycles: profile?.chemotherapyCycles ?? 0,
	chemotherapyTiming: profile?.chemotherapyTiming ?? "Not applicable",
	radiotherapyReceived: profile?.radiotherapyReceived ?? false,
	survivorshipSymptoms: (profile?.survivorshipSymptoms as string[] | undefined) ?? [],
})
const fatigueScore = (value: string) => ({ Low: 1, Moderate: 2, High: 3 })[value] ?? 2
async function recoveryHistory(userId: string, current: WellnessDto["assessment"]) {
	const from = new Date()
	from.setUTCDate(from.getUTCDate() - 7)
	const [logs, actions] = await Promise.all([
		db
			.selectFrom("dailyAssessments")
			.select("data")
			.where("userId", "=", userId)
			.where("logDate", ">=", from)
			.orderBy("logDate", "desc")
			.limit(7)
			.execute(),
		db
			.selectFrom("weeklyPlanActionLogs")
			.select("status")
			.where("userId", "=", userId)
			.where("actionDate", ">=", from)
			.execute(),
	])
	const previous = logs.slice(1).map((log) => log.data as WellnessDto["assessment"])
	const average = (values: number[]) =>
		values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0
	const completed = actions.filter((action) => action.status === "completed").length
	const attempted = completed + actions.filter((action) => action.status === "skipped").length
	return {
		completionRate: attempted ? completed / attempted : 0.5,
		activityTrend: current.activityMinutes - average(previous.map((log) => log.activityMinutes)),
		fatigueTrend: fatigueScore(current.fatigue) - average(previous.map((log) => fatigueScore(log.fatigue))),
	}
}
export async function getProfile(auth: AuthContext) {
	const profile = await patientProfile(auth.userId)
	if (!profile) return null
	// Profiles created before migration 012 have null treatment fields, so fill the form defaults.
	return {
		...profile,
		dateOfBirth: dateKey(profile.dateOfBirth),
		diseaseStage: profile.diseaseStage ?? "Unknown",
		tumorLocation: profile.tumorLocation ?? "Unknown",
		surgeryPerformed: profile.surgeryPerformed ?? false,
		chemotherapyReceived: profile.chemotherapyReceived ?? false,
		chemotherapyCycles: profile.chemotherapyCycles ?? 0,
		chemotherapyTiming: profile.chemotherapyTiming ?? "Not applicable",
		radiotherapyReceived: profile.radiotherapyReceived ?? false,
		survivorshipSymptoms: (profile.survivorshipSymptoms as string[] | null) ?? [],
	}
}
export async function saveProfile(auth: AuthContext, data: WellnessDto["profile"]) {
	const row = await db
		.updateTable("patientProfiles")
		.set({
			...data,
			dateOfBirth: asDate(data.dateOfBirth),
			survivorshipSymptoms: sql<Json>`cast(${JSON.stringify(data.survivorshipSymptoms)} as jsonb)`,
			updatedAt: sql`now()`,
		})
		.where("userId", "=", auth.userId)
		.returningAll()
		.executeTakeFirst()
	const profile = row ? await getProfile(auth) : null
	if (profile && profile.survivorshipSymptoms.some((symptom) => RED_FLAGS.has(symptom)))
		await insertPlan(auth.userId, startOfWeek(), "model", urgentPlan(profile.survivorshipSymptoms))
	return profile
}
export async function createNextWeeklyPlan(userId: string, weekStart: string) {
	const end = new Date(`${weekStart}T00:00:00Z`)
	end.setUTCDate(end.getUTCDate() + 7)
	const latest = await db
		.selectFrom("dailyAssessments")
		.select("data")
		.where("userId", "=", userId)
		.where("logDate", ">=", asDate(weekStart))
		.where("logDate", "<", end)
		.orderBy("logDate", "desc")
		.executeTakeFirst()
	if (!latest) return null
	const profile = await patientProfile(userId)
	return insertPlan(
		userId,
		startOfWeek(end.toISOString().slice(0, 10)),
		"model",
		await modelPlan(
			latest.data as WellnessDto["assessment"],
			asModelProfile(profile),
			await recoveryHistory(userId, latest.data as WellnessDto["assessment"])
		)
	)
}
async function planForDate(userId: string, date = today()) {
	return db
		.selectFrom("weeklyPlans")
		.selectAll()
		.where("userId", "=", userId)
		.where("weekStart", "=", asDate(startOfWeek(date)))
		.executeTakeFirst()
}
export async function getWeeklyPlan(auth: AuthContext, date = today()) {
	let plan = await planForDate(auth.userId, date)
	if (!plan && startOfWeek(date) === startOfWeek()) {
		await createStarterPlan(auth.userId)
		plan = await planForDate(auth.userId, date)
	}
	if (!plan) return null
	const actions = await db
		.selectFrom("weeklyPlanActionLogs")
		.select(["actionKey", "status"])
		.where("userId", "=", auth.userId)
		.where("weeklyPlanId", "=", plan.id)
		.where("actionDate", "=", asDate(date))
		.execute()
	const states = new Map(actions.map((action) => [action.actionKey, action.status]))
	return {
		id: plan.id,
		weekStart: dateKey(plan.weekStart),
		source: plan.source,
		reason: plan.reason,
		items: (plan.items as GeneratedRecommendation[]).map((item) => ({
			...item,
			goals: (item.goals ?? []).map((goal) => ({
				id: `${item.id}:${goal.id}`,
				title: goal.title,
				status: states.get(`${item.id}:${goal.id}`) ?? "open",
			})),
		})),
	}
}
export async function updatePlanAction(
	auth: AuthContext,
	actionKey: string,
	status: WellnessDto["dailyAction"]["status"],
	date = today()
) {
	const plan = await planForDate(auth.userId, date)
	if (!plan) return null
	const valid = (plan.items as GeneratedRecommendation[]).some((item) =>
		(item.goals ?? []).some((goal) => `${item.id}:${goal.id}` === actionKey)
	)
	if (!valid) return null
	const action = await db
		.insertInto("weeklyPlanActionLogs")
		.values({
			id: randomUUID(),
			userId: auth.userId,
			weeklyPlanId: plan.id,
			actionKey,
			actionDate: asDate(date),
			status,
		})
		.onConflict((conflict) =>
			conflict
				.columns(["userId", "weeklyPlanId", "actionKey", "actionDate"])
				.doUpdateSet({ status, updatedAt: sql`now()` })
		)
		.returningAll()
		.executeTakeFirstOrThrow()
	await queueWeeklyAchievement(auth.userId)
	return action
}
export async function getOverview(auth: AuthContext) {
	const user = await db.selectFrom("users").select(["name", "role"]).where("id", "=", auth.userId).executeTakeFirst()
	if (!user) return null
	if (auth.role === "oncologist" || auth.role === "caregiver") {
		const patients = await db
			.selectFrom("users")
			.select(["id", "name", "email", "role", "createdAt"])
			.where("role", "in", ["patient", "relative"])
			.orderBy("createdAt", "desc")
			.execute()
		return { kind: "end-user" as const, user, patients }
	}
	const [assessment, plan, goals] = await Promise.all([
		getDailyLog(auth, today()),
		getWeeklyPlan(auth),
		getPersonalGoals(auth),
	])
	return { kind: "clinical" as const, user, assessment, plan, goals, resources }
}
export async function saveDailyLog(auth: AuthContext, data: WellnessDto["dailyLog"]) {
	const { date, ...assessment } = data
	await db
		.insertInto("dailyAssessments")
		.values({
			id: randomUUID(),
			userId: auth.userId,
			logDate: asDate(date),
			data: sql<Json>`cast(${JSON.stringify(assessment)} as jsonb)`,
		})
		.onConflict((conflict) =>
			conflict
				.columns(["userId", "logDate"])
				.doUpdateSet({ data: sql<Json>`cast(${JSON.stringify(assessment)} as jsonb)`, updatedAt: sql`now()` })
		)
		.execute()
	const profile = await patientProfile(auth.userId)
	const history = await recoveryHistory(auth.userId, assessment)
	await Promise.all([
		queueWeeklyAchievement(auth.userId),
		queueWeeklyPlan(auth.userId),
		insertPlan(
			auth.userId,
			startOfWeek(date),
			"model",
			await modelPlan(assessment, asModelProfile(profile), history)
		),
	])
	return getDailyLog(auth, date)
}
export async function getDailyLog(auth: AuthContext, date: string) {
	const row = await db
		.selectFrom("dailyAssessments")
		.select("data")
		.where("userId", "=", auth.userId)
		.where("logDate", "=", asDate(date))
		.executeTakeFirst()
	return row?.data ?? null
}
export async function getCalendar(auth: AuthContext, from: string, to: string) {
	const [assessments, actions] = await Promise.all([
		db
			.selectFrom("dailyAssessments")
			.select("logDate")
			.where("userId", "=", auth.userId)
			.where("logDate", ">=", asDate(from))
			.where("logDate", "<=", asDate(to))
			.execute(),
		db
			.selectFrom("weeklyPlanActionLogs")
			.select(["actionDate", "status"])
			.where("userId", "=", auth.userId)
			.where("actionDate", ">=", asDate(from))
			.where("actionDate", "<=", asDate(to))
			.execute(),
	])
	const days = new Map<string, { logged: boolean; completedActions: number; skippedActions: number }>()
	for (const assessment of assessments)
		days.set(dateKey(assessment.logDate), { logged: true, completedActions: 0, skippedActions: 0 })
	for (const action of actions) {
		const key = dateKey(action.actionDate)
		const day = days.get(key) ?? { logged: false, completedActions: 0, skippedActions: 0 }
		if (action.status === "completed") day.completedActions += 1
		if (action.status === "skipped") day.skippedActions += 1
		days.set(key, day)
	}
	return [...days.entries()].map(([date, value]) => ({ date, ...value }))
}
export const getPersonalGoals = (auth: AuthContext) =>
	db
		.selectFrom("goals")
		.selectAll()
		.where("userId", "=", auth.userId)
		.where("generatedGoalKey", "is", null)
		.orderBy("createdAt", "desc")
		.execute()
export const createGoal = (auth: AuthContext, data: WellnessDto["createGoal"]) =>
	db
		.insertInto("goals")
		.values({ id: randomUUID(), userId: auth.userId, ...data })
		.returningAll()
		.executeTakeFirstOrThrow()
export const updatePersonalGoal = (auth: AuthContext, id: string, completed: boolean) =>
	db
		.updateTable("goals")
		.set({ completed })
		.where("id", "=", id)
		.where("userId", "=", auth.userId)
		.where("generatedGoalKey", "is", null)
		.returningAll()
		.executeTakeFirst()
export const getAchievements = (auth: AuthContext) =>
	db
		.selectFrom("weeklyAchievements")
		.selectAll()
		.where("userId", "=", auth.userId)
		.orderBy("weekStart", "desc")
		.execute()
export async function getResources() {
	const caregiverResources = await db
		.selectFrom("caregiverResources")
		.select(["id", "category", "title", "summary", "readTime"])
		.orderBy("createdAt", "desc")
		.execute()
	return [...caregiverResources, ...resources]
}

async function caregiverPatient(patientId: string) {
	return db
		.selectFrom("users")
		.select(["id", "name"])
		.where("id", "=", patientId)
		.where("role", "in", ["patient", "relative"])
		.executeTakeFirst()
}

export async function getCaregiverSupport(auth: AuthContext) {
	if (auth.role !== "caregiver") return null
	const [patients, tasks, notes] = await Promise.all([
		db
			.selectFrom("users")
			.select(["id", "name", "email", "role"])
			.where("role", "in", ["patient", "relative"])
			.orderBy("createdAt", "desc")
			.execute(),
		db
			.selectFrom("caregiverSupportTasks")
			.selectAll()
			.where("caregiverId", "=", auth.userId)
			.orderBy("createdAt", "desc")
			.execute(),
		db
			.selectFrom("caregiverNotes")
			.selectAll()
			.where("caregiverId", "=", auth.userId)
			.orderBy("createdAt", "desc")
			.execute(),
	])
	const summaries = await Promise.all(
		patients.map(async (patient) => {
			const [plan, achievement] = await Promise.all([
				planForDate(patient.id),
				db
					.selectFrom("weeklyAchievements")
					.select(["loggedDays", "completedActions", "skippedActions"])
					.where("userId", "=", patient.id)
					.orderBy("weekStart", "desc")
					.executeTakeFirst(),
			])
			return {
				...patient,
				planItems: (plan?.items as GeneratedRecommendation[] | undefined) ?? [],
				achievement: achievement ?? { loggedDays: 0, completedActions: 0, skippedActions: 0 },
			}
		})
	)
	return { patients: summaries, tasks, notes }
}

export async function getPatientManagement(auth: AuthContext) {
	if (auth.role !== "oncologist") return null
	const patients = await db
		.selectFrom("users")
		.leftJoin("patientProfiles", "patientProfiles.userId", "users.id")
		.select([
			"users.id",
			"users.name",
			"users.email",
			"users.role",
			"patientProfiles.dateOfBirth",
			"patientProfiles.sex",
			"patientProfiles.treatmentStatus",
			"patientProfiles.treatmentHistory",
			"patientProfiles.survivorshipSymptoms",
		])
		.where("users.role", "in", ["patient", "relative"])
		.orderBy("users.createdAt", "desc")
		.execute()
	return Promise.all(
		patients.map(async (patient) => {
			const [dailyLog, plan, achievement] = await Promise.all([
				db
					.selectFrom("dailyAssessments")
					.select(["data", "logDate"])
					.where("userId", "=", patient.id)
					.orderBy("logDate", "desc")
					.executeTakeFirst(),
				planForDate(patient.id),
				db
					.selectFrom("weeklyAchievements")
					.select(["loggedDays", "completedActions", "skippedActions"])
					.where("userId", "=", patient.id)
					.orderBy("weekStart", "desc")
					.executeTakeFirst(),
			])
			return {
				...patient,
				dailyLog: dailyLog ? { ...dailyLog, logDate: dateKey(dailyLog.logDate) } : null,
				planItems: (plan?.items as GeneratedRecommendation[] | undefined) ?? [],
				achievement: achievement ?? { loggedDays: 0, completedActions: 0, skippedActions: 0 },
			}
		})
	)
}

export async function getManagedPatients(auth: AuthContext) {
	if (auth.role === "oncologist")
		return db
			.selectFrom("users")
			.select(["id", "name", "email", "role"])
			.where("role", "in", ["patient", "relative"])
			.orderBy("createdAt", "desc")
			.execute()
	if (auth.role === "caregiver") {
		const support = await getCaregiverSupport(auth)
		return (
			support?.patients.map(({ id, name, email, role, achievement }) => ({
				id,
				name,
				email,
				role,
				achievement,
			})) ?? []
		)
	}
	return null
}

export async function getManagedPatient(auth: AuthContext, patientId: string) {
	if (auth.role === "oncologist")
		return (await getPatientManagement(auth))?.find((patient) => patient.id === patientId) ?? null
	if (auth.role === "caregiver") {
		const support = await getCaregiverSupport(auth)
		const patient = support?.patients.find((item) => item.id === patientId)
		if (!patient) return null
		return {
			...patient,
			tasks: support?.tasks.filter((task) => task.patientId === patientId) ?? [],
			notes: support?.notes.filter((note) => note.patientId === patientId) ?? [],
		}
	}
	return null
}

export async function createCaregiverTask(auth: AuthContext, data: WellnessDto["caregiverTask"]) {
	if (auth.role !== "caregiver" || !(await caregiverPatient(data.patientId))) return null
	return db
		.insertInto("caregiverSupportTasks")
		.values({ id: randomUUID(), caregiverId: auth.userId, patientId: data.patientId, title: data.title })
		.returningAll()
		.executeTakeFirstOrThrow()
}

export async function updateCaregiverTask(auth: AuthContext, id: string, completed: boolean) {
	if (auth.role !== "caregiver") return null
	return db
		.updateTable("caregiverSupportTasks")
		.set({ completed, updatedAt: sql`now()` })
		.where("id", "=", id)
		.where("caregiverId", "=", auth.userId)
		.returningAll()
		.executeTakeFirst()
}

export async function createCaregiverNote(auth: AuthContext, data: WellnessDto["caregiverNote"]) {
	if (auth.role !== "caregiver" || !(await caregiverPatient(data.patientId))) return null
	return db
		.insertInto("caregiverNotes")
		.values({ id: randomUUID(), caregiverId: auth.userId, patientId: data.patientId, body: data.body })
		.returningAll()
		.executeTakeFirstOrThrow()
}

export async function createCaregiverResource(auth: AuthContext, data: WellnessDto["caregiverResource"]) {
	if (auth.role !== "caregiver") return null
	return db
		.insertInto("caregiverResources")
		.values({ id: randomUUID(), caregiverId: auth.userId, ...data })
		.returningAll()
		.executeTakeFirstOrThrow()
}

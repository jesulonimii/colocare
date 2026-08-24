import type { FastifyInstance } from "fastify"
import { requireAuth } from "../../auth.js"
import { WellnessSchema } from "./wellness.dto.js"
import {
	createCaregiverNote,
	createCaregiverResource,
	createCaregiverTask,
	createGoal,
	getAchievements,
	getCalendar,
	getCaregiverSupport,
	getDailyLog,
	getManagedPatient,
	getManagedPatients,
	getOverview,
	getPatientManagement,
	getPersonalGoals,
	getResources,
	getWeeklyPlan,
	saveDailyLog,
	updateCaregiverTask,
	updatePersonalGoal,
	updatePlanAction,
} from "./wellness.service.js"

export async function wellnessRoutes(app: FastifyInstance) {
	app.get("/overview", async (request, reply) => {
		const overview = await getOverview(await requireAuth(request))
		return overview ?? reply.status(401).send({ message: "Your session has expired. Please sign in again." })
	})
	app.get("/daily-log", async (request) =>
		getDailyLog(await requireAuth(request), (request.query as { date: string }).date)
	)
	app.post("/daily-log", async (request) =>
		saveDailyLog(await requireAuth(request), WellnessSchema.dailyLog.parse(request.body))
	)
	app.get("/calendar", async (request) => {
		const { from, to } = request.query as { from: string; to: string }
		return getCalendar(await requireAuth(request), from, to)
	})
	app.get("/achievements", async (request) => getAchievements(await requireAuth(request)))
	app.get("/weekly-plan", async (request) =>
		getWeeklyPlan(await requireAuth(request), (request.query as { date?: string }).date)
	)
	app.patch("/weekly-plan/actions/:actionKey", async (request, reply) => {
		const action = await updatePlanAction(
			await requireAuth(request),
			(request.params as { actionKey: string }).actionKey,
			WellnessSchema.dailyAction.parse(request.body).status,
			WellnessSchema.dailyAction.parse(request.body).date
		)
		return action ?? reply.status(404).send({ message: "Plan action not found" })
	})
	app.get("/goals", async (request) => getPersonalGoals(await requireAuth(request)))
	app.post("/goals", async (request) =>
		createGoal(await requireAuth(request), WellnessSchema.createGoal.parse(request.body))
	)
	app.patch("/goals/:id", async (request, reply) => {
		const goal = await updatePersonalGoal(
			await requireAuth(request),
			(request.params as { id: string }).id,
			WellnessSchema.updateGoal.parse(request.body).completed
		)
		return goal ?? reply.status(404).send({ message: "Goal not found" })
	})
	app.get("/resources", () => getResources())
	app.post("/resources", async (request, reply) => {
		const resource = await createCaregiverResource(
			await requireAuth(request),
			WellnessSchema.caregiverResource.parse(request.body)
		)
		return resource ?? reply.status(403).send({ message: "Caregiver access required" })
	})
	app.get("/caregiver-support", async (request, reply) => {
		const support = await getCaregiverSupport(await requireAuth(request))
		return support ?? reply.status(403).send({ message: "Caregiver access required" })
	})
	app.get("/patient-management", async (request, reply) => {
		const patients = await getPatientManagement(await requireAuth(request))
		return patients ?? reply.status(403).send({ message: "Oncologist access required" })
	})
	app.get("/patients", async (request, reply) => {
		const patients = await getManagedPatients(await requireAuth(request))
		return patients ?? reply.status(403).send({ message: "Staff access required" })
	})
	app.get("/patients/:id", async (request, reply) => {
		const patient = await getManagedPatient(await requireAuth(request), (request.params as { id: string }).id)
		return patient ?? reply.status(404).send({ message: "Patient not found" })
	})
	app.post("/caregiver-support/tasks", async (request, reply) => {
		const task = await createCaregiverTask(
			await requireAuth(request),
			WellnessSchema.caregiverTask.parse(request.body)
		)
		return task ?? reply.status(403).send({ message: "Caregiver access required" })
	})
	app.patch("/caregiver-support/tasks/:id", async (request, reply) => {
		const task = await updateCaregiverTask(
			await requireAuth(request),
			(request.params as { id: string }).id,
			WellnessSchema.caregiverTaskUpdate.parse(request.body).completed
		)
		return task ?? reply.status(404).send({ message: "Support task not found" })
	})
	app.post("/caregiver-support/notes", async (request, reply) => {
		const note = await createCaregiverNote(
			await requireAuth(request),
			WellnessSchema.caregiverNote.parse(request.body)
		)
		return note ?? reply.status(403).send({ message: "Caregiver access required" })
	})
}

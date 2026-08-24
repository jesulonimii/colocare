import { z } from "zod"

const profile = z.object({
	name: z.string().min(2).max(80),
	age: z.number().int().min(18).max(120),
	treatmentStage: z.enum(["Post-treatment", "In treatment", "Long-term survivor"]),
	caregiverName: z.string().max(80).optional(),
})

const assessment = z.object({
	waterGlasses: z.number().int().min(0).max(20),
	activityMinutes: z.number().int().min(0).max(1000),
	sleepHours: z.number().min(0).max(24),
	stressLevel: z.number().int().min(1).max(5),
	appetite: z.enum(["Poor", "Fair", "Good"]),
	bowelComfort: z.enum(["Comfortable", "Occasional discomfort", "Persistent discomfort"]),
	fatigue: z.enum(["Low", "Moderate", "High"]),
})

const createGoal = z.object({
	title: z.string().min(3).max(120),
	category: z.enum(["Movement", "Hydration", "Nutrition", "Rest"]),
})
const updateGoal = z.object({ completed: z.boolean() })
const logDate = z.iso.date().refine((value) => value <= new Date().toISOString().slice(0, 10), {
	message: "Daily logs cannot be created for a future date.",
})
const dailyLog = assessment.extend({ date: logDate })
const dailyAction = z.object({ status: z.enum(["open", "completed", "skipped"]), date: logDate })
const caregiverTask = z.object({ patientId: z.uuid(), title: z.string().min(3).max(160) })
const caregiverTaskUpdate = z.object({ completed: z.boolean() })
const caregiverNote = z.object({ patientId: z.uuid(), body: z.string().min(3).max(1000) })
const caregiverResource = z.object({
	category: z.string().trim().min(2).max(80),
	title: z.string().trim().min(3).max(160),
	summary: z.string().trim().min(10).max(1000),
	readTime: z.string().trim().min(2).max(40).default("2 min read"),
})

export const WellnessSchema = {
	profile,
	assessment,
	createGoal,
	updateGoal,
	dailyLog,
	dailyAction,
	caregiverTask,
	caregiverTaskUpdate,
	caregiverNote,
	caregiverResource,
} as const

export type WellnessDto = { [K in keyof typeof WellnessSchema]: z.infer<(typeof WellnessSchema)[K]> }

import { z } from "zod"

const profile = z
	.object({
		dateOfBirth: z.iso.date(),
		sex: z.string().min(1).max(30),
		treatmentStatus: z.enum(["Post-treatment", "In treatment", "Long-term survivor"]),
		diseaseStage: z.enum(["Early", "Locally advanced", "Metastatic", "Unknown"]),
		tumorLocation: z.enum(["Right colon", "Left colon", "Rectum", "Unknown"]),
		surgeryPerformed: z.boolean(),
		chemotherapyReceived: z.boolean(),
		chemotherapyCycles: z.number().int().min(0).max(40),
		chemotherapyTiming: z.enum(["Before surgery", "After surgery", "Both", "Not applicable"]),
		radiotherapyReceived: z.boolean(),
		survivorshipSymptoms: z.array(z.string().min(1).max(80)),
	})
	.superRefine((data, context) => {
		if (!data.chemotherapyReceived && data.chemotherapyCycles !== 0)
			context.addIssue({
				code: "custom",
				path: ["chemotherapyCycles"],
				message: "Cycles must be zero when chemotherapy was not received.",
			})
		if (!data.chemotherapyReceived && data.chemotherapyTiming !== "Not applicable")
			context.addIssue({
				code: "custom",
				path: ["chemotherapyTiming"],
				message: "Select not applicable when chemotherapy was not received.",
			})
	})

const assessment = z.object({
	waterGlasses: z.number().int().min(0).max(20),
	activityMinutes: z.number().int().min(0).max(1000),
	sleepHours: z.number().min(0).max(24),
	stressLevel: z.number().int().min(1).max(5),
	appetite: z.enum(["Poor", "Fair", "Good"]),
	bowelComfort: z.enum(["Comfortable", "Occasional discomfort", "Persistent discomfort"]),
	fatigue: z.enum(["Low", "Moderate", "High"]),
	symptoms: z.array(z.string().min(1).max(80)),
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

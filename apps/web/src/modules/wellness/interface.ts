export type Profile = {
	name: string
	age: number
	treatmentStage: "Post-treatment" | "In treatment" | "Long-term survivor"
	caregiverName?: string
}

export type Assessment = {
	waterGlasses: number
	activityMinutes: number
	sleepHours: number
	stressLevel: number
	appetite: "Poor" | "Fair" | "Good"
	bowelComfort: "Comfortable" | "Occasional discomfort" | "Persistent discomfort"
	fatigue: "Low" | "Moderate" | "High"
}

export type Goal = {
	id: string
	title: string
	category: "Movement" | "Hydration" | "Nutrition" | "Rest"
	completed: boolean
}

export type Recommendation = {
	id: string
	category: string
	title: string
	detail: string
	tone?: "green" | "amber" | "blue"
	goals: { id: string; title: string; status: "open" | "completed" | "skipped" }[]
}
export type WeeklyPlan = {
	id: string
	weekStart: string
	source: "starter" | "model"
	reason: string
	items: Recommendation[]
}

export type Resource = { id: string; category: string; title: string; readTime: string; summary: string }

export type CalendarDay = { date: string; logged: boolean; completedActions: number; skippedActions: number }
export type Achievement = {
	weekStart: string
	loggedDays: number
	completedActions: number
	totalActions: number
	skippedActions: number
	score: number
}
export type CaregiverSupport = {
	patients: {
		id: string
		name: string
		email: string
		role: "patient" | "relative"
		planItems: Recommendation[]
		achievement: Pick<Achievement, "loggedDays" | "completedActions" | "skippedActions">
	}[]
	tasks: { id: string; patientId: string; title: string; completed: boolean; createdAt: string }[]
	notes: { id: string; patientId: string; body: string; createdAt: string }[]
}
export type ManagedPatient = {
	id: string
	name: string
	email: string
	role: "patient" | "relative"
	dateOfBirth: string | null
	sex: string | null
	treatmentStatus: string | null
	treatmentHistory: string[] | null
	survivorshipSymptoms: string[] | null
	dailyLog: (Assessment & { logDate: string }) | null
	planItems: Recommendation[]
	achievement: Pick<Achievement, "loggedDays" | "completedActions" | "skippedActions">
}
export type StaffPatient = {
	id: string
	name: string
	email: string
	role: "patient" | "relative"
	achievement?: Pick<Achievement, "loggedDays" | "completedActions" | "skippedActions">
}
export type CaregiverPatientDetail = CaregiverSupport["patients"][number] & {
	tasks: CaregiverSupport["tasks"]
	notes: CaregiverSupport["notes"]
}

type OverviewUser = { name: string; role: "oncologist" | "caregiver" | "patient" | "relative" }

export type Overview =
	| {
			kind: "clinical"
			user: OverviewUser
			assessment: Assessment | null
			plan: WeeklyPlan | null
			goals: Goal[]
			resources: Resource[]
	  }
	| {
			kind: "end-user"
			user: OverviewUser
			patients: { id: string; name: string; email: string; role: string; createdAt: string }[]
	  }

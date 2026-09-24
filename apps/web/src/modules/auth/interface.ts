export type Role = "pending" | "oncologist" | "caregiver" | "patient" | "relative"

export type User = { id: string; name: string; email: string; role: Role }

export type AuthResponse = { token: string; user: User }

export type SignupPayload = { name: string; email: string; password: string }

export type LoginPayload = Pick<SignupPayload, "email" | "password">

export type OnboardingPayload = {
	role: Exclude<Role, "pending">
	patientProfile?: {
		dateOfBirth: string
		sex: string
		treatmentStatus: "In treatment" | "Post-treatment" | "Long-term survivor"
		diseaseStage: "Early" | "Locally advanced" | "Metastatic" | "Unknown"
		tumorLocation: "Right colon" | "Left colon" | "Rectum" | "Unknown"
		surgeryPerformed: boolean
		chemotherapyReceived: boolean
		chemotherapyCycles: number
		chemotherapyTiming: "Before surgery" | "After surgery" | "Both" | "Not applicable"
		radiotherapyReceived: boolean
		treatmentHistory: string[]
		survivorshipSymptoms: string[]
		consentGiven: true
	}
}

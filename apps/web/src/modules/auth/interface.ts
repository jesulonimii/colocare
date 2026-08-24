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
		treatmentHistory: string[]
		survivorshipSymptoms: string[]
		consentGiven: true
	}
}

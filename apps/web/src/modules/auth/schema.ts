import { z } from "zod"

const role = z.enum(["oncologist", "caregiver", "patient", "relative"])
const treatmentStatus = z.enum(["In treatment", "Post-treatment", "Long-term survivor"])

export const signupSchema = z.object({
	name: z.string().trim().min(2, "Enter your name").max(80),
	email: z.email("Enter a valid email address"),
	password: z.string().min(8, "Password must be at least 8 characters").max(100),
})

export const loginSchema = signupSchema.pick({ email: true, password: true })

export const onboardingSchema = z
	.object({
		role,
		dateOfBirth: z.string(),
		sex: z.string(),
		treatmentStatus,
		treatmentHistory: z.string(),
		symptoms: z.string(),
		consentGiven: z.boolean(),
	})
	.superRefine((data, context) => {
		if (data.role !== "patient") return
		if (!data.dateOfBirth)
			context.addIssue({ code: "custom", path: ["dateOfBirth"], message: "Date of birth is required" })
		if (!data.sex) context.addIssue({ code: "custom", path: ["sex"], message: "Sex is required" })
		if (!data.treatmentHistory.trim())
			context.addIssue({ code: "custom", path: ["treatmentHistory"], message: "Treatment history is required" })
		if (!data.consentGiven)
			context.addIssue({ code: "custom", path: ["consentGiven"], message: "Consent is required" })
	})

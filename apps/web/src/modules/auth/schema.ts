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
		diseaseStage: z.enum(["Early", "Locally advanced", "Metastatic", "Unknown"]),
		tumorLocation: z.enum(["Right colon", "Left colon", "Rectum", "Unknown"]),
		surgeryPerformed: z.enum(["yes", "no"]),
		chemotherapyReceived: z.enum(["yes", "no"]),
		chemotherapyCycles: z.number().int().min(0).max(40),
		chemotherapyTiming: z.enum(["Before surgery", "After surgery", "Both", "Not applicable"]),
		radiotherapyReceived: z.enum(["yes", "no"]),
		treatmentHistory: z.string(),
		symptoms: z.string(),
		consentGiven: z.boolean(),
	})
	.superRefine((data, context) => {
		if (data.role !== "patient") return
		if (!data.dateOfBirth)
			context.addIssue({ code: "custom", path: ["dateOfBirth"], message: "Date of birth is required" })
		if (!data.sex) context.addIssue({ code: "custom", path: ["sex"], message: "Sex is required" })
		if (data.chemotherapyReceived === "no" && data.chemotherapyCycles !== 0)
			context.addIssue({
				code: "custom",
				path: ["chemotherapyCycles"],
				message: "Use 0 when chemotherapy was not received",
			})
		if (!data.consentGiven)
			context.addIssue({ code: "custom", path: ["consentGiven"], message: "Consent is required" })
	})

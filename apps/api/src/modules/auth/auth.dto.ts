import { z } from "zod"

const role = z.enum(["oncologist", "caregiver", "patient", "relative"])
const patientProfile = z.object({
	dateOfBirth: z.iso.date(),
	sex: z.string().min(1).max(30),
	treatmentStatus: z.enum(["In treatment", "Post-treatment", "Long-term survivor"]),
	treatmentHistory: z.array(z.string().min(1).max(80)).min(1),
	survivorshipSymptoms: z.array(z.string().min(1).max(80)),
	consentGiven: z.literal(true),
})
const signup = z.object({ name: z.string().min(2).max(80), email: z.email(), password: z.string().min(8).max(100) })
const login = z.object({ email: z.email(), password: z.string().min(8).max(100) })
const onboarding = z.object({ role, patientProfile: patientProfile.optional() }).superRefine((data, context) => {
	if (data.role === "patient" && !data.patientProfile)
		context.addIssue({
			code: "custom",
			path: ["patientProfile"],
			message: "Complete your patient onboarding profile.",
		})
})

export const AuthSchema = { signup, login, onboarding } as const
export type AuthDto = { [K in keyof typeof AuthSchema]: z.infer<(typeof AuthSchema)[K]> }

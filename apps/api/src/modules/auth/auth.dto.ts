import { z } from "zod"

const role = z.enum(["oncologist", "caregiver", "patient", "relative"])
const patientProfile = z
	.object({
		dateOfBirth: z.iso.date(),
		sex: z.string().min(1).max(30),
		treatmentStatus: z.enum(["In treatment", "Post-treatment", "Long-term survivor"]),
		diseaseStage: z.enum(["Early", "Locally advanced", "Metastatic", "Unknown"]),
		tumorLocation: z.enum(["Right colon", "Left colon", "Rectum", "Unknown"]),
		surgeryPerformed: z.boolean(),
		chemotherapyReceived: z.boolean(),
		chemotherapyCycles: z.number().int().min(0).max(40),
		chemotherapyTiming: z.enum(["Before surgery", "After surgery", "Both", "Not applicable"]),
		radiotherapyReceived: z.boolean(),
		treatmentHistory: z.array(z.string().min(1).max(80)),
		survivorshipSymptoms: z.array(z.string().min(1).max(80)),
		consentGiven: z.literal(true),
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

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Navigate, useNavigate } from "react-router-dom"
import type { z } from "zod"
import type { OnboardingPayload } from "@/modules/auth/interface"
import { onboardingSchema } from "@/modules/auth/schema"
import { useCompleteOnboarding } from "@/modules/auth/service"
import { useAuth } from "@/modules/auth/store"
import { AppButton } from "@/shared/components/AppButton"
import { AppCheckbox } from "@/shared/components/AppCheckbox"
import { FormInput } from "@/shared/components/FormInput"
import { FormSelect } from "@/shared/components/FormSelect"
import { FormView } from "@/shared/components/FormView"
import { OnboardingProgress } from "@/shared/components/OnboardingProgress"

const splitList = (value: string) =>
	value
		.split(",")
		.map((item) => item.trim())
		.filter(Boolean)

export default function Onboarding() {
	const auth = useAuth()
	const navigate = useNavigate()
	const completeOnboarding = useCompleteOnboarding()
	const [step, setStep] = useState(1)
	const form = useForm<z.infer<typeof onboardingSchema>>({
		resolver: zodResolver(onboardingSchema),
		defaultValues: {
			role: "patient",
			dateOfBirth: "",
			sex: "",
			treatmentStatus: "Post-treatment",
			treatmentHistory: "",
			symptoms: "",
			consentGiven: false,
		},
	})
	if (!auth.token) return <Navigate to="/login" replace />
	if (auth.user?.role !== "pending") return <Navigate to="/dashboard" replace />
	const patient = form.watch("role") === "patient"
	const total = patient ? 3 : 2
	const visibleStep = patient ? step : step === 3 ? 2 : step
	const submit = form.handleSubmit((values) => {
		const patientProfile = patient
			? {
					dateOfBirth: values.dateOfBirth,
					sex: values.sex,
					treatmentStatus: values.treatmentStatus,
					treatmentHistory: splitList(values.treatmentHistory),
					survivorshipSymptoms: splitList(values.symptoms),
					consentGiven: true as const,
				}
			: undefined
		completeOnboarding.mutate({ role: values.role, patientProfile } satisfies OnboardingPayload, {
			onSuccess: (result) => {
				auth.setup(result)
				navigate("/dashboard")
			},
		})
	})
	return (
		<main className="min-h-screen bg-mist p-5">
			<FormView
				onSubmit={submit}
				form={form}
				className="mx-auto my-8 max-w-2xl rounded-3xl bg-white p-7 shadow-sm"
			>
				<OnboardingProgress step={visibleStep} total={total} />
				{step === 1 && (
					<>
						<h1 className="mt-6 text-3xl font-bold">Choose your role</h1>
						<div className="mt-6 grid gap-4 sm:grid-cols-2">
							<FormSelect name="role" label="Your role">
								<optgroup label="End user">
									<option value="oncologist">Oncologist</option>
									<option value="caregiver">Caregiver</option>
								</optgroup>
								<optgroup label="Clinical user">
									<option value="patient">Patient</option>
									<option value="relative">Relative</option>
								</optgroup>
							</FormSelect>
						</div>
						<AppButton
							type="button"
							className="mt-6"
							onClick={async () => {
								if (await form.trigger("role")) setStep(patient ? 2 : 3)
							}}
						>
							Continue
						</AppButton>
					</>
				)}
				{step === 2 && (
					<>
						<h1 className="mt-6 text-3xl font-bold">Your health background</h1>
						<p className="mt-2 text-sm text-slate-600">
							This creates your baseline profile before the lifestyle assessment.
						</p>
						<div className="mt-6 grid gap-4 sm:grid-cols-2">
							<FormInput name="dateOfBirth" label="Date of birth" type="date" />
							<FormSelect name="sex" label="Sex">
								<option value="">Select</option>
								<option>Female</option>
								<option>Male</option>
								<option>Intersex</option>
								<option>Prefer not to say</option>
							</FormSelect>
							<FormSelect name="treatmentStatus" label="Treatment status">
								<option>In treatment</option>
								<option>Post-treatment</option>
								<option>Long-term survivor</option>
							</FormSelect>
							<FormInput
								name="treatmentHistory"
								label="Treatment history"
								hint="(comma-separated)"
								className="sm:col-span-2"
							/>
							<FormInput
								name="symptoms"
								label="Current symptoms"
								hint="(optional, comma-separated)"
								className="sm:col-span-2"
							/>
						</div>
						<AppButton
							type="button"
							className="mt-6"
							onClick={async () => {
								if (await form.trigger(["dateOfBirth", "sex", "treatmentHistory"])) setStep(3)
							}}
						>
							Continue
						</AppButton>
					</>
				)}
				{step === 3 && (
					<>
						<h1 className="mt-6 text-3xl font-bold">{patient ? "Review and consent" : "You’re ready"}</h1>
						{patient && (
							<div className="mt-6 rounded-2xl bg-sage/60 p-4">
								<AppCheckbox name="consentGiven">
									I consent to use of this profile for lifestyle decision support. ColoCare does not
									replace clinical care.
								</AppCheckbox>
							</div>
						)}
						{completeOnboarding.error && (
							<p className="mt-3 text-sm text-red-700">{completeOnboarding.error.message}</p>
						)}
						<AppButton className="mt-6" disabled={completeOnboarding.isPending}>
							Open my dashboard
						</AppButton>
					</>
				)}
			</FormView>
		</main>
	)
}

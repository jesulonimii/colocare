import { useEffect } from "react"
import { useForm } from "react-hook-form"
import type { Assessment } from "@/modules/wellness/interface"
import { useDailyLog, useSaveDailyLog } from "@/modules/wellness/service"
import { AppButton } from "@/shared/components/AppButton"
import { FormInput } from "@/shared/components/FormInput"
import { FormSelect } from "@/shared/components/FormSelect"
import { FormView } from "@/shared/components/FormView"

const initial: Assessment = {
	waterGlasses: 4,
	activityMinutes: 30,
	sleepHours: 7,
	stressLevel: 3,
	appetite: "Fair",
	bowelComfort: "Occasional discomfort",
	fatigue: "Moderate",
	symptoms: [],
}
type DailyLogValues = Omit<Assessment, "symptoms"> & { symptoms: string }
const fields: { key: Exclude<keyof Assessment, "symptoms">; label: string; options?: string[]; type?: "number" }[] = [
	{ key: "waterGlasses", label: "Water glasses", type: "number" },
	{ key: "activityMinutes", label: "Movement minutes", type: "number" },
	{ key: "sleepHours", label: "Sleep hours", type: "number" },
	{ key: "stressLevel", label: "Stress (1–5)", type: "number" },
	{ key: "appetite", label: "Appetite", options: ["Poor", "Fair", "Good"] },
	{
		key: "bowelComfort",
		label: "Bowel comfort",
		options: ["Comfortable", "Occasional discomfort", "Persistent discomfort"],
	},
	{ key: "fatigue", label: "Fatigue", options: ["Low", "Moderate", "High"] },
]

export function DailyLogForm({ date, onSaved }: { date: string; onSaved?: () => void }) {
	const { data } = useDailyLog(date)
	const save = useSaveDailyLog()
	const form = useForm<DailyLogValues>({ defaultValues: { ...initial, symptoms: "" } })
	useEffect(() => {
		form.reset(data ? { ...data, symptoms: data.symptoms.join(", ") } : { ...initial, symptoms: "" })
	}, [data, form])
	return (
		<FormView
			form={form}
			onSubmit={form.handleSubmit(({ symptoms, ...values }) => save.mutate({ ...values, symptoms: symptoms.split(",").map((item) => item.trim()).filter(Boolean), date }, { onSuccess: onSaved }))}
			className="mt-5 grid gap-3 sm:grid-cols-2"
		>
			{fields.map((field) => (
				<div key={field.key} className={field.options ? "" : ""}>
					{field.options ? (
						<FormSelect name={field.key} label={field.label}>
							{field.options.map((option) => (
								<option key={option}>{option}</option>
							))}
						</FormSelect>
					) : (
						<FormInput
							name={field.key}
							label={field.label}
							type="number"
							min={0}
							max={field.key === "stressLevel" ? 5 : 1000}
							step={field.key === "sleepHours" ? 0.5 : 1}
						/>
					)}
				</div>
			))}
			<FormInput name="symptoms" label="New or current symptoms" hint="(comma-separated; blood in stool, unexplained weight loss, or persistent bloating need urgent care)" className="sm:col-span-2" />
			<AppButton className="sm:col-span-2" disabled={save.isPending}>
				{save.isPending ? "Saving daily log…" : "Save daily log"}
			</AppButton>
			{save.isSuccess && (
				<p className="text-sm font-medium text-moss sm:col-span-2">Your personalized plan has been updated.</p>
			)}
		</FormView>
	)
}

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import type { Profile as ProfileType } from "@/modules/wellness/interface"
import { useProfile, useSaveProfile } from "@/modules/wellness/service"
import { AppButton } from "@/shared/components/AppButton"
import { AppCheckbox } from "@/shared/components/AppCheckbox"
import { FormInput } from "@/shared/components/FormInput"
import { FormSelect } from "@/shared/components/FormSelect"
import { FormView } from "@/shared/components/FormView"
import { SectionHeading } from "@/shared/components/SectionHeading"

const initial: ProfileType = {
	dateOfBirth: "",
	sex: "",
	treatmentStatus: "Post-treatment",
	diseaseStage: "Unknown",
	tumorLocation: "Unknown",
	surgeryPerformed: false,
	chemotherapyReceived: false,
	chemotherapyCycles: 0,
	chemotherapyTiming: "Not applicable",
	radiotherapyReceived: false,
	survivorshipSymptoms: [],
}
const splitList = (value: string) =>
	value
		.split(",")
		.map((item) => item.trim())
		.filter(Boolean)
type FormValues = Omit<ProfileType, "survivorshipSymptoms"> & { symptoms: string }

export default function Profile() {
	const { data } = useProfile()
	const save = useSaveProfile()
	const form = useForm<FormValues>({ defaultValues: { ...initial, symptoms: "" } })
	useEffect(() => {
		if (data) form.reset({ ...data, symptoms: data.survivorshipSymptoms.join(", ") })
	}, [data, form])
	return (
		<div className="space-y-7">
			<SectionHeading
				eyebrow="My profile"
				title="Your treatment background"
				copy="Used only for the synthetic-data lifestyle demonstration. It does not diagnose cancer or replace clinical care."
			/>
			<FormView
				form={form}
				onSubmit={form.handleSubmit(({ symptoms, ...values }) =>
					save.mutate({ ...values, survivorshipSymptoms: splitList(symptoms) })
				)}
				className="max-w-2xl space-y-4 rounded-2xl border border-sage bg-white p-5 sm:p-6"
			>
				<div className="grid gap-4 sm:grid-cols-2">
					<FormInput name="dateOfBirth" label="Date of birth" type="date" />
					<FormInput name="sex" label="Sex" />
					<FormSelect name="treatmentStatus" label="Treatment status">
						<option>Post-treatment</option>
						<option>In treatment</option>
						<option>Long-term survivor</option>
					</FormSelect>
					<FormSelect name="diseaseStage" label="Stage at diagnosis">
						<option>Early</option>
						<option>Locally advanced</option>
						<option>Metastatic</option>
						<option>Unknown</option>
					</FormSelect>
					<FormSelect name="tumorLocation" label="Tumour location">
						<option>Right colon</option>
						<option>Left colon</option>
						<option>Rectum</option>
						<option>Unknown</option>
					</FormSelect>
					<FormInput name="chemotherapyCycles" label="Chemotherapy cycles" type="number" min={0} max={40} />
					<FormSelect name="chemotherapyTiming" label="Chemotherapy timing">
						<option>Not applicable</option>
						<option>Before surgery</option>
						<option>After surgery</option>
						<option>Both</option>
					</FormSelect>
					<FormInput
						name="symptoms"
						label="Current symptoms"
						hint="(comma-separated)"
						className="sm:col-span-2"
					/>
				</div>
				<AppCheckbox name="surgeryPerformed">Surgery performed</AppCheckbox>
				<AppCheckbox name="chemotherapyReceived">Chemotherapy received</AppCheckbox>
				<AppCheckbox name="radiotherapyReceived">Radiotherapy received</AppCheckbox>
				<AppButton disabled={save.isPending}>{save.isPending ? "Saving…" : "Save profile"}</AppButton>
				{save.isSuccess && <p className="text-sm font-medium text-moss">Profile saved.</p>}
			</FormView>
		</div>
	)
}

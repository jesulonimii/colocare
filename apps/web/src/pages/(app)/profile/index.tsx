import { useEffect } from "react"
import { useForm } from "react-hook-form"
import type { Profile as ProfileType } from "@/modules/wellness/interface"
import { useProfile, useSaveProfile } from "@/modules/wellness/service"
import { AppButton } from "@/shared/components/AppButton"
import { FormInput } from "@/shared/components/FormInput"
import { FormSelect } from "@/shared/components/FormSelect"
import { FormView } from "@/shared/components/FormView"
import { SectionHeading } from "@/shared/components/SectionHeading"

const initial: ProfileType = { name: "", age: 18, treatmentStage: "Post-treatment", caregiverName: "" }
export default function Profile() {
	const { data } = useProfile()
	const save = useSaveProfile()
	const form = useForm<ProfileType>({ defaultValues: initial })
	useEffect(() => {
		if (data) form.reset(data)
	}, [data, form])
	return (
		<div className="space-y-7">
			<SectionHeading
				eyebrow="My profile"
				title="Your personal details"
				copy="This MVP illustrates a private survivor profile. A production system would use secure authentication, encryption, and role-based access."
			/>
			<FormView
				form={form}
				onSubmit={form.handleSubmit((values) => save.mutate(values))}
				className="max-w-2xl space-y-4 rounded-2xl border border-sage bg-white p-5 sm:p-6"
			>
				<FormInput name="name" label="Name" />
				<FormInput name="age" label="Age" type="number" min={18} max={120} />
				<FormSelect name="treatmentStage" label="Where are you in your journey?">
					<option>Post-treatment</option>
					<option>In treatment</option>
					<option>Long-term survivor</option>
				</FormSelect>
				<FormInput name="caregiverName" label="Caregiver or support person" hint="(optional)" />
				<AppButton disabled={save.isPending}>{save.isPending ? "Saving…" : "Save profile"}</AppButton>
				{save.isSuccess && <p className="text-sm font-medium text-moss">Profile saved.</p>}
			</FormView>
		</div>
	)
}

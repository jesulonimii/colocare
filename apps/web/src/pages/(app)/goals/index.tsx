import { Plus, Target } from "lucide-react"
import { useForm } from "react-hook-form"
import { useCreateGoal, useGoals, useTogglePersonalGoal } from "@/modules/wellness/service"
import { AppButton } from "@/shared/components/AppButton"
import { FormInput } from "@/shared/components/FormInput"
import { FormView } from "@/shared/components/FormView"
import { SectionHeading } from "@/shared/components/SectionHeading"
export default function Goals() {
	const { data = [] } = useGoals()
	const toggle = useTogglePersonalGoal()
	const create = useCreateGoal()
	const form = useForm<{ title: string }>({ defaultValues: { title: "" } })
	return (
		<div className="space-y-7">
			<SectionHeading
				eyebrow="Personal goals"
				title="Your own intentions"
				copy="Keep goals that matter to you here. Your personalized-plan actions stay in your plan."
			/>
			<div className="grid gap-3">
				{data.map((goal) => (
					<label
						key={goal.id}
						className="flex cursor-pointer items-center gap-4 rounded-2xl border border-sage bg-white p-5"
					>
						<input
							checked={goal.completed}
							onChange={(event) => toggle.mutate({ id: goal.id, completed: event.target.checked })}
							type="checkbox"
							className="size-5 accent-[#2d6a4f]"
						/>
						<span className="grid size-9 place-items-center rounded-xl bg-sage text-moss">
							<Target size={17} />
						</span>
						<span className="flex-1">
							<b className={goal.completed ? "text-slate-400 line-through" : "text-ink"}>{goal.title}</b>
							<small className="mt-1 block text-slate-500">{goal.category}</small>
						</span>
					</label>
				))}
			</div>
			<FormView
				form={form}
				onSubmit={form.handleSubmit(({ title }) =>
					create.mutate({ title, category: "Nutrition" }, { onSuccess: () => form.reset() })
				)}
				className="rounded-2xl border border-dashed border-moss/30 bg-white p-5"
			>
				<p className="font-semibold">Add a personal goal</p>
				<div className="mt-3 flex flex-col gap-3 sm:flex-row">
					<FormInput
						name="title"
						label="Goal"
						placeholder="For example, add fruit to breakfast"
						className="min-w-0 flex-1"
					/>
					<AppButton variant="secondary" disabled={create.isPending}>
						<Plus size={16} className="mr-1 inline" />
						Add goal
					</AppButton>
				</div>
			</FormView>
		</div>
	)
}

import { ArrowUpRight, BookOpen } from "lucide-react"
import { useForm } from "react-hook-form"
import { useAuth } from "@/modules/auth/store"
import { useCreateCaregiverResource, useResources } from "@/modules/wellness/service"
import { AppButton } from "@/shared/components/AppButton"
import { FormInput } from "@/shared/components/FormInput"
import { FormView } from "@/shared/components/FormView"
import { SectionHeading } from "@/shared/components/SectionHeading"
export default function Resources() {
	const { data = [], isLoading } = useResources()
	const isCaregiver = useAuth((state) => state.user?.role === "caregiver")
	const publish = useCreateCaregiverResource()
	const form = useForm<{ category: string; title: string; summary: string; readTime: string }>({
		defaultValues: { category: "Everyday support", title: "", summary: "", readTime: "2 min read" },
	})
	return (
		<div className="space-y-7">
			<SectionHeading
				eyebrow="Resource centre"
				title="Trusted support for everyday life"
				copy="Short, approachable guides to help you prepare for conversations with your care team."
			/>
			{isCaregiver ? (
				<FormView
					form={form}
					onSubmit={form.handleSubmit((values) => publish.mutate(values, { onSuccess: () => form.reset() }))}
					className="rounded-2xl border border-sage bg-white p-5"
				>
					<p className="font-bold">Add a practical resource</p>
					<p className="mt-1 text-sm text-slate-600">
						Share non-clinical support ideas. Do not publish diagnosis, treatment, or emergency advice.
					</p>
					<div className="mt-4 grid gap-3 sm:grid-cols-2">
						<FormInput name="title" label="Title" className="sm:col-span-2" />
						<FormInput name="category" label="Category" />
						<FormInput name="readTime" label="Read time" />
						<label className="grid gap-1.5 text-sm font-medium text-ink sm:col-span-2">
							Summary
							<textarea
								{...form.register("summary")}
								rows={3}
								className="rounded-xl border border-sage bg-white px-3 py-2 text-sm outline-none focus:border-moss"
							/>
						</label>
					</div>
					<AppButton className="mt-4" disabled={publish.isPending}>
						{publish.isPending ? "Publishing…" : "Publish resource"}
					</AppButton>
				</FormView>
			) : null}
			<div className="grid gap-4 md:grid-cols-2">
				{isLoading ? (
					<p>Loading resources…</p>
				) : (
					data.map((resource) => (
						<article key={resource.id} className="rounded-2xl border border-sage bg-white p-5">
							<div className="flex items-start justify-between">
								<span className="grid size-10 place-items-center rounded-xl bg-sage text-moss">
									<BookOpen size={19} />
								</span>
								<span className="text-xs text-slate-500">{resource.readTime}</span>
							</div>
							<p className="mt-4 text-xs font-bold tracking-wider text-moss uppercase">
								{resource.category}
							</p>
							<h2 className="mt-1 text-lg font-bold">{resource.title}</h2>
							<p className="mt-2 text-sm leading-6 text-slate-600">{resource.summary}</p>
							<button
								type="button"
								onClick={() =>
									window.alert(
										"This school-project MVP uses a resource preview. In production this would open a clinically reviewed article."
									)
								}
								className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-moss"
							>
								Open guide <ArrowUpRight size={15} />
							</button>
						</article>
					))
				)}
			</div>
		</div>
	)
}

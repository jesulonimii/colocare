import { Droplets, Footprints, Moon, Sparkles } from "lucide-react"
import { useUpdatePlanAction, useWeeklyPlan } from "@/modules/wellness/service"
import { SectionHeading } from "@/shared/components/SectionHeading"

const icon = {
	Hydration: Droplets,
	Movement: Footprints,
	"Rest & stress": Moon,
	Nutrition: Sparkles,
	Wellbeing: Sparkles,
}
const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(new Date())

export default function Recommendations() {
	const { data: plan, isLoading } = useWeeklyPlan(today)
	const updateAction = useUpdatePlanAction()
	return (
		<div className="space-y-7">
			<SectionHeading
				eyebrow="Your personalized plan"
				title="Your personalized plan"
				copy="Small supportive actions for this week. Discuss changes that affect your symptoms, diet, or activity with your care team."
			/>
			{isLoading ? (
				<p>Loading your personalized plan…</p>
			) : !plan ? (
				<section className="rounded-2xl border border-sage bg-white p-6 text-slate-600">
					Your next plan is being prepared. Keep completing daily check-ins so it can reflect your routine.
				</section>
			) : (
				<>
					<p className="rounded-xl bg-sage p-4 text-sm text-moss">
						<b>Why this plan:</b> {plan.reason}
					</p>
					<div className="space-y-4">
						{plan.items.map((item) => {
							const Icon = icon[item.category as keyof typeof icon] ?? Sparkles
							return (
								<article key={item.id} className="rounded-2xl border border-sage bg-white p-5 sm:p-6">
									<div className="flex gap-4">
										<div className="grid size-11 shrink-0 place-items-center rounded-xl bg-sage text-moss">
											<Icon size={21} />
										</div>
										<div className="min-w-0 flex-1">
											<p className="text-xs font-bold tracking-wider text-moss uppercase">
												{item.category}
											</p>
											<h2 className="mt-1 text-lg font-bold">{item.title}</h2>
											<p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
												{item.detail}
											</p>
											<div className="mt-4 rounded-xl bg-mist p-4">
												<p className="text-sm font-bold text-ink">Today’s action steps</p>
												<div className="mt-3 space-y-3">
													{item.goals.map((goal) => (
														<div key={goal.id} className="flex items-center gap-2 text-sm">
															<input
																checked={goal.status === "completed"}
																disabled={updateAction.isPending}
																onChange={(event) =>
																	updateAction.mutate({
																		id: goal.id,
																		status: event.target.checked
																			? "completed"
																			: "open",
																		date: today,
																	})
																}
																type="checkbox"
																className="size-4 accent-[#2d6a4f]"
															/>
															<span
																className={`flex-1 ${goal.status === "completed" ? "text-slate-400 line-through" : "text-slate-700"}`}
															>
																{goal.title}
															</span>
															{goal.status === "skipped" ? (
																<button
																	type="button"
																	onClick={() =>
																		updateAction.mutate({
																			id: goal.id,
																			status: "open",
																			date: today,
																		})
																	}
																	className="text-xs font-semibold text-moss"
																>
																	Undo skip
																</button>
															) : (
																<button
																	type="button"
																	onClick={() =>
																		updateAction.mutate({
																			id: goal.id,
																			status: "skipped",
																			date: today,
																		})
																	}
																	className="text-xs font-semibold text-slate-500"
																>
																	Skip today
																</button>
															)}
														</div>
													))}
												</div>
											</div>
										</div>
									</div>
								</article>
							)
						})}
					</div>
				</>
			)}
		</div>
	)
}

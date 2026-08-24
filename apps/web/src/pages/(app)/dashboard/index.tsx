import { ArrowRight, CheckCircle2, ClipboardList, HeartHandshake, NotebookPen, Plus, Users } from "lucide-react"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import {
	useAchievements,
	useCaregiverSupport,
	useCreateCaregiverNote,
	useCreateCaregiverTask,
	useOverview,
	usePatientManagement,
	usePatients,
	useToggleCaregiverTask,
} from "@/modules/wellness/service"
import { AppButton } from "@/shared/components/AppButton"
import { FormInput } from "@/shared/components/FormInput"
import { FormView } from "@/shared/components/FormView"
import { SectionHeading } from "@/shared/components/SectionHeading"

function CaregiverDashboard({ name }: { name: string }) {
	const { data, isLoading } = useCaregiverSupport()
	const createTask = useCreateCaregiverTask()
	const toggleTask = useToggleCaregiverTask()
	const createNote = useCreateCaregiverNote()
	const taskForm = useForm<{ patientId: string; title: string }>({ defaultValues: { patientId: "", title: "" } })
	const noteForm = useForm<{ patientId: string; body: string }>({ defaultValues: { patientId: "", body: "" } })
	const patients = data?.patients ?? []
	const patientName = (id: string) => patients.find((patient) => patient.id === id)?.name ?? "Selected person"
	return (
		<div className="space-y-7">
			<SectionHeading
				eyebrow="Caregiver workspace"
				title={`Support with confidence, ${name.split(" ")[0]}.`}
				copy="Help with routines, practical preparation, and questions for care visits. You cannot change a patient’s recommendations or complete their actions."
			/>
			{isLoading ? (
				<p className="text-slate-500">Preparing your support workspace…</p>
			) : patients.length ? (
				<>
					<section className="grid gap-4 md:grid-cols-3">
						{patients.map((patient) => (
							<article key={patient.id} className="rounded-2xl border border-sage bg-white p-5">
								<div className="flex items-center gap-3">
									<span className="grid size-10 place-items-center rounded-xl bg-sage text-moss">
										<HeartHandshake size={19} />
									</span>
									<div>
										<h2 className="font-bold">{patient.name}</h2>
										<p className="text-sm text-slate-500">
											{patient.achievement.loggedDays} days checked in this week
										</p>
									</div>
								</div>
								<p className="mt-4 text-sm text-slate-600">
									{patient.planItems.length
										? `${patient.planItems.length} focus areas in this week’s plan`
										: "No current plan available"}
								</p>
								<p className="mt-2 text-sm font-semibold text-moss">
									{patient.achievement.completedActions} actions completed ·{" "}
									{patient.achievement.skippedActions} skipped
								</p>
							</article>
						))}
					</section>
					<div className="grid gap-5 lg:grid-cols-2">
						<section className="rounded-2xl border border-sage bg-white p-5">
							<h2 className="font-bold">Practical support tasks</h2>
							<p className="mt-1 text-sm text-slate-600">
								Create reminders for things you can help with—never medical instructions.
							</p>
							<div className="mt-4 space-y-3">
								{data?.tasks.map((task) => (
									<label
										key={task.id}
										className="flex items-center gap-3 rounded-xl bg-mist p-3 text-sm"
									>
										<input
											type="checkbox"
											checked={task.completed}
											onChange={(event) =>
												toggleTask.mutate({ id: task.id, completed: event.target.checked })
											}
											className="size-4 accent-[#2d6a4f]"
										/>
										<span
											className={
												task.completed
													? "flex-1 text-slate-400 line-through"
													: "flex-1 text-ink"
											}
										>
											{task.title}
											<small className="mt-0.5 block text-slate-500">
												Supporting {patientName(task.patientId)}
											</small>
										</span>
									</label>
								))}
							</div>
							<FormView
								form={taskForm}
								onSubmit={taskForm.handleSubmit((values) =>
									createTask.mutate(values, { onSuccess: () => taskForm.reset() })
								)}
								className="mt-4 grid gap-3"
							>
								<FormInput
									name="title"
									label="Support task"
									placeholder="For example, refill the water bottle"
								/>
								<label className="grid gap-1.5 text-sm font-medium">
									Person
									<select
										{...taskForm.register("patientId", { required: true })}
										className="rounded-xl border border-sage bg-white px-3 py-2"
									>
										<option value="">Select a person</option>
										{patients.map((patient) => (
											<option key={patient.id} value={patient.id}>
												{patient.name}
											</option>
										))}
									</select>
								</label>
								<AppButton disabled={createTask.isPending}>
									<Plus size={16} className="mr-1 inline" />
									Add support task
								</AppButton>
							</FormView>
						</section>
						<section className="rounded-2xl border border-sage bg-white p-5">
							<div className="flex items-center gap-2">
								<NotebookPen size={19} className="text-moss" />
								<h2 className="font-bold">Questions for the next visit</h2>
							</div>
							<p className="mt-1 text-sm text-slate-600">
								Keep practical questions to discuss with the patient and care team. This is not an
								emergency channel.
							</p>
							<div className="mt-4 space-y-3">
								{data?.notes.map((note) => (
									<div key={note.id} className="rounded-xl bg-mist p-3 text-sm">
										<p>{note.body}</p>
										<small className="mt-1 block text-slate-500">
											For {patientName(note.patientId)}
										</small>
									</div>
								))}
							</div>
							<FormView
								form={noteForm}
								onSubmit={noteForm.handleSubmit((values) =>
									createNote.mutate(values, { onSuccess: () => noteForm.reset() })
								)}
								className="mt-4 grid gap-3"
							>
								<label className="grid gap-1.5 text-sm font-medium">
									Question or note
									<textarea
										{...noteForm.register("body", { required: true })}
										rows={3}
										className="rounded-xl border border-sage bg-white px-3 py-2 outline-none focus:border-moss"
									/>
								</label>
								<label className="grid gap-1.5 text-sm font-medium">
									Person
									<select
										{...noteForm.register("patientId", { required: true })}
										className="rounded-xl border border-sage bg-white px-3 py-2"
									>
										<option value="">Select a person</option>
										{patients.map((patient) => (
											<option key={patient.id} value={patient.id}>
												{patient.name}
											</option>
										))}
									</select>
								</label>
								<AppButton disabled={createNote.isPending}>Save question</AppButton>
							</FormView>
							<Link
								to="/resources"
								className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-moss"
							>
								Populate the Resource Centre <ArrowRight size={15} />
							</Link>
						</section>
					</div>
				</>
			) : (
				<section className="rounded-2xl border border-sage bg-white p-6 text-slate-600">
					No patients or relatives are available to support yet. Add practical resources to the Resource
					Centre while you wait.
				</section>
			)}
		</div>
	)
}

function OncologistDashboard({ name }: { name: string }) {
	const { data: patients = [], isLoading } = usePatientManagement()
	return (
		<div className="space-y-7">
			<SectionHeading
				eyebrow="Clinical patient management"
				title={`Patient overview, ${name.split(" ")[0]}.`}
				copy="Review profile, treatment context, daily wellbeing, and plan consistency to support clinical conversations."
			/>
			{isLoading ? (
				<p className="text-slate-500">Loading patient information…</p>
			) : patients.length ? (
				<div className="space-y-4">
					{patients.map((patient) => (
						<article key={patient.id} className="rounded-2xl border border-sage bg-white p-5">
							<div className="flex flex-wrap items-start justify-between gap-3">
								<div>
									<h2 className="text-lg font-bold">{patient.name}</h2>
									<p className="text-sm text-slate-500">
										{patient.email} · {patient.role}
									</p>
								</div>
								<span className="rounded-full bg-sage px-3 py-1 text-xs font-semibold text-moss">
									{patient.achievement.loggedDays} logged days
								</span>
							</div>
							<div className="mt-5 grid gap-3 text-sm md:grid-cols-3">
								<div className="rounded-xl bg-mist p-3">
									<b>Treatment context</b>
									<p className="mt-1 text-slate-600">{patient.treatmentStatus ?? "Not recorded"}</p>
									<p className="mt-1 text-slate-500">
										{patient.treatmentHistory?.join(", ") || "No history recorded"}
									</p>
								</div>
								<div className="rounded-xl bg-mist p-3">
									<b>Latest wellbeing log</b>
									<p className="mt-1 text-slate-600">
										{patient.dailyLog
											? `${patient.dailyLog.logDate} · ${patient.dailyLog.fatigue} fatigue · stress ${patient.dailyLog.stressLevel}/5`
											: "No log recorded"}
									</p>
									<p className="mt-1 text-slate-500">
										{patient.dailyLog
											? `${patient.dailyLog.activityMinutes} min movement · ${patient.dailyLog.waterGlasses} glasses`
											: ""}
									</p>
								</div>
								<div className="rounded-xl bg-mist p-3">
									<b>Plan consistency</b>
									<p className="mt-1 text-slate-600">
										{patient.achievement.completedActions} actions completed ·{" "}
										{patient.achievement.skippedActions} skipped
									</p>
									<p className="mt-1 text-slate-500">
										{patient.planItems.map((item) => item.title).join(" · ") || "No current plan"}
									</p>
								</div>
							</div>
							{patient.survivorshipSymptoms?.length ? (
								<p className="mt-3 text-sm text-slate-600">
									<b>Reported symptoms:</b> {patient.survivorshipSymptoms.join(", ")}
								</p>
							) : null}
						</article>
					))}
				</div>
			) : (
				<section className="rounded-2xl border border-sage bg-white p-6 text-slate-600">
					No patients or relatives have registered yet.
				</section>
			)}
		</div>
	)
}

function CaregiverInsights({ name }: { name: string }) {
	const { data, isLoading } = useCaregiverSupport()
	const patients = data?.patients ?? []
	const checkIns = patients.reduce((total, patient) => total + patient.achievement.loggedDays, 0)
	const completedActions = patients.reduce((total, patient) => total + patient.achievement.completedActions, 0)
	const openTasks = data?.tasks.filter((task) => !task.completed).length ?? 0
	return (
		<div className="space-y-7">
			<SectionHeading
				eyebrow="Caregiver insights"
				title={`Support overview, ${name.split(" ")[0]}.`}
				copy="A high-level view of routine consistency and the support that needs your attention."
			/>
			{isLoading ? (
				<p className="text-slate-500">Loading support insights…</p>
			) : (
				<>
					<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
						<div className="rounded-2xl bg-moss p-5 text-white">
							<p className="text-3xl font-bold">{patients.length}</p>
							<p className="mt-1 text-sm text-emerald-50">people under support</p>
						</div>
						<div className="rounded-2xl border border-sage bg-white p-5">
							<p className="text-3xl font-bold text-moss">{checkIns}</p>
							<p className="mt-1 text-sm text-slate-500">check-ins this week</p>
						</div>
						<div className="rounded-2xl border border-sage bg-white p-5">
							<p className="text-3xl font-bold text-moss">{completedActions}</p>
							<p className="mt-1 text-sm text-slate-500">actions completed</p>
						</div>
						<div className="rounded-2xl border border-sage bg-white p-5">
							<p className="text-3xl font-bold text-moss">{openTasks}</p>
							<p className="mt-1 text-sm text-slate-500">support tasks open</p>
						</div>
					</section>
					<section className="rounded-2xl border border-sage bg-white p-5">
						<h2 className="font-bold">Next step</h2>
						<p className="mt-2 text-sm text-slate-600">
							Open Patients to review a person’s routine progress, add practical support tasks, or prepare
							questions for their next visit.
						</p>
						<Link
							to="/patients"
							className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-moss"
						>
							Open patients <ArrowRight size={15} />
						</Link>
					</section>
				</>
			)}
		</div>
	)
}

function OncologistInsights({ name }: { name: string }) {
	const { data: patients = [], isLoading } = usePatients()
	const patientCount = patients.filter((patient) => patient.role === "patient").length
	const relativeCount = patients.filter((patient) => patient.role === "relative").length
	return (
		<div className="space-y-7">
			<SectionHeading
				eyebrow="Clinical insights"
				title={`Patient overview, ${name.split(" ")[0]}.`}
				copy="A high-level summary of the people in your workspace. Open an individual record to review clinical context."
			/>
			{isLoading ? (
				<p className="text-slate-500">Loading clinical insights…</p>
			) : (
				<>
					<section className="grid gap-4 sm:grid-cols-3">
						<div className="rounded-2xl bg-moss p-5 text-white">
							<p className="text-3xl font-bold">{patients.length}</p>
							<p className="mt-1 text-sm text-emerald-50">people registered</p>
						</div>
						<div className="rounded-2xl border border-sage bg-white p-5">
							<p className="text-3xl font-bold text-moss">{patientCount}</p>
							<p className="mt-1 text-sm text-slate-500">patient records</p>
						</div>
						<div className="rounded-2xl border border-sage bg-white p-5">
							<p className="text-3xl font-bold text-moss">{relativeCount}</p>
							<p className="mt-1 text-sm text-slate-500">relative records</p>
						</div>
					</section>
					<section className="rounded-2xl border border-sage bg-white p-5">
						<h2 className="font-bold">Clinical review</h2>
						<p className="mt-2 text-sm text-slate-600">
							Open Patients to select a record and review treatment context, reported symptoms, recent
							wellbeing, and plan consistency.
						</p>
						<Link
							to="/patients"
							className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-moss"
						>
							Open patients <ArrowRight size={15} />
						</Link>
					</section>
				</>
			)}
		</div>
	)
}

export default function Dashboard() {
	const { data, isLoading, error } = useOverview()
	const { data: achievements = [] } = useAchievements()
	if (isLoading) return <p className="text-slate-500">Preparing your workspace…</p>
	if (error || !data)
		return (
			<p className="rounded-xl bg-red-50 p-4 text-red-700">
				We could not load this workspace. Sign in again after the API is running.
			</p>
		)
	if (data.kind === "end-user" && data.user.role === "caregiver") return <CaregiverInsights name={data.user.name} />
	if (data.kind === "end-user" && data.user.role === "oncologist") return <OncologistInsights name={data.user.name} />
	if (data.kind === "end-user")
		return (
			<div className="space-y-7">
				<SectionHeading
					eyebrow="End-user dashboard"
					title={`Hello, ${data.user.name.split(" ")[0]}.`}
					copy="Review the people registered in your support workspace. Clinical decisions remain the responsibility of qualified healthcare professionals."
				/>
				<div className="grid gap-4 md:grid-cols-3">
					<div className="rounded-2xl bg-moss p-5 text-white md:col-span-2">
						<Users size={22} className="text-emerald-200" />
						<p className="mt-4 text-3xl font-bold">{data.patients.length}</p>
						<p className="text-sm text-emerald-50">patients and relatives registered</p>
					</div>
					<div className="rounded-2xl border border-sage bg-white p-5">
						<ClipboardList className="text-moss" />
						<p className="mt-3 font-bold">
							{data.user.role === "oncologist" ? "Clinical overview" : "Support overview"}
						</p>
						<p className="mt-1 text-sm text-slate-500">
							Use this view to guide conversations, not to diagnose.
						</p>
					</div>
				</div>
				<section>
					<h2 className="text-xl font-bold">Registered people</h2>
					<div className="mt-3 overflow-hidden rounded-2xl border border-sage bg-white">
						{data.patients.length ? (
							data.patients.map((person) => (
								<div
									key={person.id}
									className="flex items-center justify-between border-b border-sage p-4 last:border-0"
								>
									<div>
										<p className="font-semibold">{person.name}</p>
										<p className="text-sm text-slate-500">{person.email}</p>
									</div>
									<span className="rounded-full bg-sage px-3 py-1 text-xs font-semibold capitalize text-moss">
										{person.role}
									</span>
								</div>
							))
						) : (
							<p className="p-5 text-sm text-slate-500">No clinical users have registered yet.</p>
						)}
					</div>
				</section>
			</div>
		)
	const latestAchievement = achievements[0]
	const completedActions =
		data.plan?.items.flatMap((item) => item.goals).filter((goal) => goal.status === "completed").length ?? 0
	const actionCount = data.plan?.items.flatMap((item) => item.goals).length ?? 0
	return (
		<div className="space-y-7">
			<SectionHeading
				eyebrow="Clinical-user dashboard"
				title={`Hello, ${data.user.name.split(" ")[0]}.`}
				copy="Your check-ins power lifestyle decision support that you can discuss with your care team."
			/>
			<div className="grid gap-4 md:grid-cols-3">
				<div className="rounded-2xl bg-moss p-5 text-white md:col-span-2">
					<CheckCircle2 className="text-emerald-200" />
					<p className="mt-3 text-3xl font-bold">
						{completedActions}/{actionCount}
					</p>
					<p className="text-sm text-emerald-50">today’s plan actions completed</p>
				</div>
				<div className="rounded-2xl border border-sage bg-white p-5">
					<p className="font-bold">Lifestyle check-in</p>
					<p className="mt-2 text-sm text-slate-500">
						{data.assessment
							? "Your latest daily log has been analysed."
							: "Your starter plan is ready while daily check-ins build a fuller picture."}
					</p>
					<Link
						to="/calendar"
						className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-moss"
					>
						Open daily calendar <ArrowRight size={15} />
					</Link>
				</div>
				<div className="rounded-2xl border border-sage bg-white p-5">
					<p className="font-bold">This week’s achievement</p>
					<p className="mt-2 text-3xl font-bold text-moss">{latestAchievement?.loggedDays ?? 0} days</p>
					<p className="mt-1 text-sm text-slate-500">
						{latestAchievement
							? `${latestAchievement.completedActions} actions completed${latestAchievement.skippedActions ? ` · ${latestAchievement.skippedActions} skipped` : ""}`
							: "Log a day and complete an action to build your weekly consistency."}
					</p>
					<Link to="/calendar" className="mt-4 inline-flex text-sm font-semibold text-moss">
						Open calendar
					</Link>
				</div>
			</div>
			<section>
				<div className="flex items-center justify-between gap-4">
					<h2 className="text-xl font-bold">Your personalized plan</h2>
					<Link to="/recommendations" className="text-sm font-semibold text-moss">
						View and complete plan
					</Link>
				</div>
				<div className="mt-3 grid gap-4 md:grid-cols-3">
					{data.plan?.items.length ? (
						data.plan.items.map((item) => (
							<article key={item.id} className="rounded-2xl border border-sage bg-white p-5">
								<p className="text-xs font-bold tracking-wider text-moss uppercase">{item.category}</p>
								<h3 className="mt-2 font-bold">{item.title}</h3>
								<p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
							</article>
						))
					) : (
						<p className="rounded-2xl border border-sage bg-white p-5 text-sm text-slate-500">
							Your next personalized plan is being prepared.
						</p>
					)}
				</div>
			</section>
		</div>
	)
}

import { ArrowLeft, ClipboardList, HeartHandshake } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { useAuth } from "@/modules/auth/store"
import type { CaregiverPatientDetail, ManagedPatient } from "@/modules/wellness/interface"
import { usePatient } from "@/modules/wellness/service"
import { SectionHeading } from "@/shared/components/SectionHeading"

const isOncologistDetail = (patient: ManagedPatient | CaregiverPatientDetail): patient is ManagedPatient =>
	"treatmentStatus" in patient

export default function PatientDetail() {
	const { id = "" } = useParams()
	const role = useAuth((state) => state.user?.role)
	const { data: patient, isLoading, error } = usePatient(id)
	if (isLoading) return <p className="text-slate-500">Loading patient details…</p>
	if (error || !patient)
		return <p className="rounded-xl bg-red-50 p-4 text-red-700">We could not find this patient.</p>
	const clinical = isOncologistDetail(patient)
	return (
		<div className="space-y-7">
			<Link to="/patients" className="inline-flex items-center gap-1 text-sm font-semibold text-moss">
				<ArrowLeft size={16} />
				Back to patients
			</Link>
			<SectionHeading
				eyebrow={role === "oncologist" ? "Clinical patient record" : "Support overview"}
				title={patient.name}
				copy={
					clinical ? patient.email : "Review routine progress and the practical support around this person."
				}
			/>
			<div className="grid gap-4 md:grid-cols-3">
				<section className="rounded-2xl border border-sage bg-white p-5">
					<HeartHandshake className="text-moss" />
					<h2 className="mt-3 font-bold">Weekly consistency</h2>
					<p className="mt-2 text-sm text-slate-600">
						{patient.achievement.loggedDays} check-ins · {patient.achievement.completedActions} actions
						completed · {patient.achievement.skippedActions} skipped
					</p>
				</section>
				<section className="rounded-2xl border border-sage bg-white p-5 md:col-span-2">
					<ClipboardList className="text-moss" />
					<h2 className="mt-3 font-bold">Current plan focus</h2>
					<p className="mt-2 text-sm text-slate-600">
						{patient.planItems.map((item) => item.title).join(" · ") || "No current plan available"}
					</p>
				</section>
			</div>
			{clinical ? (
				<div className="grid gap-4 md:grid-cols-2">
					<section className="rounded-2xl border border-sage bg-white p-5">
						<h2 className="font-bold">Sensitive clinical context</h2>
						<dl className="mt-4 grid gap-3 text-sm">
							<div>
								<dt className="text-slate-500">Treatment status</dt>
								<dd>{patient.treatmentStatus ?? "Not recorded"}</dd>
							</div>
							<div>
								<dt className="text-slate-500">Treatment history</dt>
								<dd>{patient.treatmentHistory?.join(", ") || "Not recorded"}</dd>
							</div>
							<div>
								<dt className="text-slate-500">Reported symptoms</dt>
								<dd>{patient.survivorshipSymptoms?.join(", ") || "None recorded"}</dd>
							</div>
						</dl>
					</section>
					<section className="rounded-2xl border border-sage bg-white p-5">
						<h2 className="font-bold">Latest wellbeing log</h2>
						<p className="mt-3 text-sm text-slate-600">
							{patient.dailyLog
								? `${patient.dailyLog.logDate} · ${patient.dailyLog.fatigue} fatigue · stress ${patient.dailyLog.stressLevel}/5 · ${patient.dailyLog.activityMinutes} minutes movement`
								: "No daily wellbeing log recorded."}
						</p>
					</section>
				</div>
			) : (
				<div className="grid gap-4 md:grid-cols-2">
					<section className="rounded-2xl border border-sage bg-white p-5">
						<h2 className="font-bold">Support tasks</h2>
						<div className="mt-3 space-y-2 text-sm">
							{patient.tasks.length ? (
								patient.tasks.map((task) => (
									<p
										key={task.id}
										className={task.completed ? "text-slate-400 line-through" : "text-slate-600"}
									>
										{task.title}
									</p>
								))
							) : (
								<p className="text-slate-500">No support tasks yet.</p>
							)}
						</div>
					</section>
					<section className="rounded-2xl border border-sage bg-white p-5">
						<h2 className="font-bold">Visit questions</h2>
						<div className="mt-3 space-y-2 text-sm">
							{patient.notes.length ? (
								patient.notes.map((note) => (
									<p key={note.id} className="text-slate-600">
										{note.body}
									</p>
								))
							) : (
								<p className="text-slate-500">No questions saved yet.</p>
							)}
						</div>
					</section>
				</div>
			)}
		</div>
	)
}

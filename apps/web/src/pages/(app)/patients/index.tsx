import { ChevronRight, Users } from "lucide-react"
import { Link } from "react-router-dom"
import { usePatients } from "@/modules/wellness/service"
import { SectionHeading } from "@/shared/components/SectionHeading"

export default function Patients() {
	const { data = [], isLoading } = usePatients()
	return (
		<div className="space-y-7">
			<SectionHeading
				eyebrow="Patient management"
				title="Patients"
				copy="Choose a patient or relative to view the information available to your role."
			/>
			{isLoading ? (
				<p className="text-slate-500">Loading patients…</p>
			) : data.length ? (
				<div className="overflow-hidden rounded-2xl border border-sage bg-white">
					{data.map((patient) => (
						<Link
							key={patient.id}
							to={`/patients/${patient.id}`}
							className="flex items-center gap-4 border-b border-sage p-5 last:border-0 hover:bg-mist"
						>
							<span className="grid size-10 place-items-center rounded-xl bg-sage text-moss">
								<Users size={18} />
							</span>
							<span className="flex-1">
								<b className="block">{patient.name}</b>
								<small className="text-slate-500">{patient.email || patient.role}</small>
							</span>
							{patient.achievement ? (
								<small className="hidden text-right text-slate-500 sm:block">
									{patient.achievement.loggedDays} check-ins
									<br />
									{patient.achievement.completedActions} actions completed
								</small>
							) : null}
							<ChevronRight size={18} className="text-slate-500" />
						</Link>
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

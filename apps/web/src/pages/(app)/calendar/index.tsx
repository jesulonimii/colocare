import { ChevronLeft, ChevronRight, Flame } from "lucide-react"
import { useMemo, useState } from "react"
import { DailyLogForm } from "@/modules/wellness/components/DailyLogForm"
import { useCalendar, useDailyLog, useUpdatePlanAction, useWeeklyPlan } from "@/modules/wellness/service"
import { AppButton } from "@/shared/components/AppButton"
import { SectionHeading } from "@/shared/components/SectionHeading"

const asKey = (date: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(date)
const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
const startOfWeek = (date: Date) => addDays(date, -((date.getDay() + 6) % 7))
const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const today = asKey(new Date())

function DailyLogPanel({ date }: { date: string }) {
	const { data, isLoading } = useDailyLog(date)
	const { data: plan } = useWeeklyPlan(date)
	const updateAction = useUpdatePlanAction()
	const [editing, setEditing] = useState(false)
	const label = new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(
		new Date(`${date}T00:00:00`)
	)
	return (
		<section className="rounded-2xl border border-sage bg-white p-5 sm:p-6">
			<p className="text-xs font-bold tracking-wider text-moss uppercase">Selected day</p>
			<h2 className="mt-1 text-xl font-bold">{label}</h2>
			{date > today ? (
				<p className="mt-4 text-sm leading-6 text-slate-500">Daily logs become available on this date.</p>
			) : isLoading ? (
				<p className="mt-4 text-sm text-slate-500">Loading daily log…</p>
			) : editing ? (
				<DailyLogForm date={date} onSaved={() => setEditing(false)} />
			) : data ? (
				<>
					<div className="mt-5 grid grid-cols-2 gap-3 text-sm">
						<div className="rounded-xl bg-mist p-3">
							<b>{data.waterGlasses}</b>
							<span className="block text-slate-500">glasses of water</span>
						</div>
						<div className="rounded-xl bg-mist p-3">
							<b>{data.activityMinutes}</b>
							<span className="block text-slate-500">movement minutes</span>
						</div>
						<div className="rounded-xl bg-mist p-3">
							<b>{data.sleepHours}</b>
							<span className="block text-slate-500">hours of sleep</span>
						</div>
						<div className="rounded-xl bg-mist p-3">
							<b>{data.stressLevel}/5</b>
							<span className="block text-slate-500">stress level</span>
						</div>
					</div>
					<AppButton type="button" className="mt-5" onClick={() => setEditing(true)}>
						Edit daily log
					</AppButton>
				</>
			) : (
				<>
					<p className="mt-4 text-sm leading-6 text-slate-600">
						No daily log yet. Add one to support your weekly achievement.
					</p>
					<AppButton type="button" className="mt-5" onClick={() => setEditing(true)}>
						Add daily log
					</AppButton>
				</>
			)}
			{date <= today && plan ? (
				<div className="mt-5 border-t border-sage pt-4">
					<p className="text-sm font-bold">Actions for this day</p>
					<div className="mt-3 space-y-2">
						{plan.items
							.flatMap((item) => item.goals)
							.map((goal) => (
								<div key={goal.id} className="flex items-center gap-2 text-sm">
									<input
										type="checkbox"
										checked={goal.status === "completed"}
										disabled={updateAction.isPending}
										onChange={(event) =>
											updateAction.mutate({
												id: goal.id,
												status: event.target.checked ? "completed" : "open",
												date,
											})
										}
										className="size-4 accent-[#2d6a4f]"
									/>
									<span
										className={
											goal.status === "completed"
												? "flex-1 text-slate-400 line-through"
												: "flex-1 text-slate-700"
										}
									>
										{goal.title}
									</span>
									{goal.status === "skipped" ? (
										<span className="text-xs text-slate-500">Skipped</span>
									) : (
										<button
											type="button"
											onClick={() =>
												updateAction.mutate({ id: goal.id, status: "skipped", date })
											}
											className="text-xs font-semibold text-slate-500"
										>
											Skip
										</button>
									)}
								</div>
							))}
					</div>
				</div>
			) : null}
		</section>
	)
}

export default function Calendar() {
	const [mode, setMode] = useState<"week" | "month">("week")
	const [cursor, setCursor] = useState(new Date())
	const [selectedDate, setSelectedDate] = useState(asKey(new Date()))
	const days = useMemo(() => {
		if (mode === "week") return Array.from({ length: 7 }, (_, index) => addDays(startOfWeek(cursor), index))
		const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
		const start = startOfWeek(first)
		return Array.from({ length: 42 }, (_, index) => addDays(start, index))
	}, [cursor, mode])
	const { data = [] } = useCalendar(asKey(days[0]), asKey(days.at(-1)!))
	const status = new Map(data.map((day) => [day.date, day]))
	const title = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(cursor)
	const calendar = (
		<div>
			<div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-semibold text-slate-500">
				{weekDays.map((day) => (
					<span key={day}>{day}</span>
				))}
			</div>
			<div className={`mt-2 grid grid-cols-7 gap-1.5 ${mode === "week" ? "sm:gap-3" : ""}`}>
				{days.map((day) => {
					const key = asKey(day)
					const entry = status.get(key)
					const future = key > today
					const muted = mode === "month" && day.getMonth() !== cursor.getMonth()
					return (
						<button
							key={key}
							type="button"
							disabled={future}
							onClick={() => setSelectedDate(key)}
							className={`relative grid h-10 place-items-center rounded-lg border text-sm font-semibold sm:h-11 ${entry?.logged ? "border-moss bg-sage text-moss" : "border-sage bg-white"} ${selectedDate === key ? "ring-2 ring-moss ring-offset-2" : ""} ${muted || future ? "opacity-35" : ""} disabled:cursor-not-allowed`}
						>
							{day.getDate()}
							{entry?.logged && (
								<Flame className="absolute right-0.5 bottom-0.5 size-3 fill-amber-500 text-amber-600" />
							)}
						</button>
					)
				})}
			</div>
		</div>
	)
	return (
		<div className="space-y-7">
			<SectionHeading
				eyebrow="Daily progress"
				title="Your check-in calendar"
				copy="A flame marks days you filled in. Choose any day to add or revisit its daily log."
			/>
			<section className="rounded-2xl border border-sage bg-white p-5 sm:p-6">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="flex items-center gap-2">
						<AppButton
							type="button"
							variant="secondary"
							onClick={() => setCursor(addDays(cursor, mode === "week" ? -7 : -30))}
						>
							<ChevronLeft size={17} />
						</AppButton>
						<h2 className="min-w-40 text-center font-bold">{title}</h2>
						<AppButton
							type="button"
							variant="secondary"
							onClick={() => setCursor(addDays(cursor, mode === "week" ? 7 : 30))}
						>
							<ChevronRight size={17} />
						</AppButton>
					</div>
					<div className="rounded-xl bg-mist p-1 text-sm font-semibold">
						<button
							type="button"
							className={`rounded-lg px-3 py-2 ${mode === "week" ? "bg-white text-moss shadow-sm" : "text-slate-500"}`}
							onClick={() => setMode("week")}
						>
							Week
						</button>
						<button
							type="button"
							className={`rounded-lg px-3 py-2 ${mode === "month" ? "bg-white text-moss shadow-sm" : "text-slate-500"}`}
							onClick={() => setMode("month")}
						>
							Month
						</button>
					</div>
				</div>
				{mode === "week" ? (
					<div className="mt-6 space-y-5">
						{calendar}
						<DailyLogPanel key={selectedDate} date={selectedDate} />
					</div>
				) : (
					<div className="mt-6 grid gap-5 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.2fr)]">
						{calendar}
						<DailyLogPanel key={selectedDate} date={selectedDate} />
					</div>
				)}
			</section>
		</div>
	)
}

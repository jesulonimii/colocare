import { BookOpen, CalendarDays, HeartPulse, Home, LogOut, Target, UserRound, Users } from "lucide-react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "@/modules/auth/store"
import { ThemeToggle } from "./ThemeToggle"

const patientLinks = [
	{ to: "/dashboard", label: "Home", icon: Home },
	{ to: "/calendar", label: "Calendar", icon: CalendarDays },
	{ to: "/recommendations", label: "Your personalized plan", icon: HeartPulse },
	{ to: "/goals", label: "Goals", icon: Target },
	{ to: "/resources", label: "Learn", icon: BookOpen },
	{ to: "/profile", label: "My profile", icon: UserRound },
]
const staffPatientsLink = { to: "/patients", label: "Patients", icon: Users }

export function AppShell() {
	const logout = useAuth((state) => state.logout)
	const user = useAuth((state) => state.user)
	const navigate = useNavigate()
	const links =
		user?.role === "caregiver"
			? [
					...patientLinks.filter((link) => link.to === "/dashboard"),
					staffPatientsLink,
					...patientLinks.filter((link) => ["/resources", "/profile"].includes(link.to)),
				]
			: user?.role === "oncologist"
				? [
						...patientLinks.filter((link) => link.to === "/dashboard"),
						staffPatientsLink,
						...patientLinks.filter((link) => link.to === "/profile"),
					]
				: patientLinks
	return (
		<div className="min-h-screen bg-mist lg:flex">
			<aside className="border-b border-sage bg-white px-4 py-4 lg:fixed lg:inset-y-0 lg:w-64 lg:border-r lg:border-b-0 lg:px-5 lg:py-7">
				<div className="mb-5 flex items-center gap-3 lg:mb-10">
					<div className="grid size-10 place-items-center rounded-xl bg-moss text-lg text-white">✦</div>
					<div className="flex-1">
						<p className="font-bold text-ink">ColoCare</p>
						<p className="text-xs text-slate-500">Your wellbeing companion</p>
					</div>
					<ThemeToggle />
				</div>
				<nav className="flex gap-1 overflow-x-auto lg:flex-col">
					{links.map(({ to, label, icon: Icon }) => (
						<NavLink
							key={to}
							to={to}
							className={({ isActive }) =>
								`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${isActive ? "bg-sage text-moss" : "text-slate-500 hover:bg-mist hover:text-ink"}`
							}
						>
							<Icon size={18} />
							{label}
						</NavLink>
					))}
				</nav>
				<button
					type="button"
					className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-mist hover:text-ink lg:mt-8"
					onClick={() => {
						logout()
						navigate("/login")
					}}
				>
					<LogOut size={18} />
					Log out
				</button>
				<p className="mt-8 hidden rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900 lg:block">
					ColoCare supports healthy routines. It does not replace advice from your healthcare team.
				</p>
			</aside>
			<main className="mx-auto max-w-6xl flex-1 p-5 sm:p-8 lg:ml-64 lg:p-10">
				<Outlet />
			</main>
		</div>
	)
}

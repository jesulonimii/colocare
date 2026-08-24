import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/modules/auth/store"
import { AppShell } from "@/shared/components/AppShell"
export default function AppLayout() {
	const user = useAuth((state) => state.user)
	const location = useLocation()
	const staffAllowed =
		user?.role === "caregiver"
			? ["/dashboard", "/patients", "/resources", "/profile"]
			: ["/dashboard", "/patients", "/profile"]
	if (
		user &&
		(user.role === "caregiver" || user.role === "oncologist") &&
		!staffAllowed.some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`))
	)
		return <Navigate to="/dashboard" replace />
	return user?.role === "pending" ? (
		<Navigate to="/onboarding" replace />
	) : user ? (
		<AppShell />
	) : (
		<Navigate to="/login" replace />
	)
}

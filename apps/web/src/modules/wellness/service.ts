import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/shared/utils/api"
import type {
	Achievement,
	Assessment,
	CalendarDay,
	CaregiverPatientDetail,
	CaregiverSupport,
	Goal,
	ManagedPatient,
	Overview,
	Profile,
	Resource,
	StaffPatient,
	WeeklyPlan,
} from "./interface"

export const useOverview = () => useQuery({ queryKey: ["overview"], queryFn: () => api<Overview>("/overview") })
export const useProfile = () => useQuery({ queryKey: ["profile"], queryFn: () => api<Profile>("/profile") })
export const useDailyLog = (date: string) =>
	useQuery({ queryKey: ["daily-log", date], queryFn: () => api<Assessment | null>(`/daily-log?date=${date}`) })
export const useCalendar = (from: string, to: string) =>
	useQuery({ queryKey: ["calendar", from, to], queryFn: () => api<CalendarDay[]>(`/calendar?from=${from}&to=${to}`) })
export const useAchievements = () =>
	useQuery({ queryKey: ["achievements"], queryFn: () => api<Achievement[]>("/achievements") })
export const useWeeklyPlan = (date = new Date().toISOString().slice(0, 10)) =>
	useQuery({ queryKey: ["weekly-plan", date], queryFn: () => api<WeeklyPlan | null>(`/weekly-plan?date=${date}`) })
export const useGoals = () => useQuery({ queryKey: ["goals"], queryFn: () => api<Goal[]>("/goals") })
export const useResources = () => useQuery({ queryKey: ["resources"], queryFn: () => api<Resource[]>("/resources") })
export const useCaregiverSupport = () =>
	useQuery({ queryKey: ["caregiver-support"], queryFn: () => api<CaregiverSupport>("/caregiver-support") })
export const usePatientManagement = () =>
	useQuery({ queryKey: ["patient-management"], queryFn: () => api<ManagedPatient[]>("/patient-management") })
export const usePatients = () => useQuery({ queryKey: ["patients"], queryFn: () => api<StaffPatient[]>("/patients") })
export const usePatient = (id: string) =>
	useQuery({
		queryKey: ["patient", id],
		queryFn: () => api<ManagedPatient | CaregiverPatientDetail>(`/patients/${id}`),
	})
const invalidate = (client: ReturnType<typeof useQueryClient>) => client.invalidateQueries({ queryKey: ["overview"] })
export function useSaveProfile() {
	const client = useQueryClient()
	return useMutation({
		mutationFn: (data: Profile) => api<Profile>("/profile", { method: "PUT", body: JSON.stringify(data) }),
		onSuccess: () => {
			client.invalidateQueries({ queryKey: ["profile"] })
			invalidate(client)
		},
	})
}
export function useSaveDailyLog() {
	const client = useQueryClient()
	return useMutation({
		mutationFn: ({ date, ...data }: Assessment & { date: string }) =>
			api<Assessment>("/daily-log", { method: "POST", body: JSON.stringify({ date, ...data }) }),
		onSuccess: (_data, variables) => {
			client.invalidateQueries({ queryKey: ["daily-log", variables.date] })
			client.invalidateQueries({ queryKey: ["calendar"] })
			client.invalidateQueries({ queryKey: ["weekly-plan"] })
			client.invalidateQueries({ queryKey: ["goals"] })
			client.invalidateQueries({ queryKey: ["achievements"] })
			invalidate(client)
		},
	})
}
export function useUpdatePlanAction() {
	const client = useQueryClient()
	return useMutation({
		mutationFn: ({ id, status, date }: { id: string; status: "open" | "completed" | "skipped"; date: string }) =>
			api(`/weekly-plan/actions/${id}`, {
				method: "PATCH",
				body: JSON.stringify({ status, date }),
			}),
		onSuccess: (_data, variables) => {
			client.invalidateQueries({ queryKey: ["weekly-plan", variables.date] })
			client.invalidateQueries({ queryKey: ["calendar"] })
			client.invalidateQueries({ queryKey: ["achievements"] })
			invalidate(client)
		},
	})
}
export function useTogglePersonalGoal() {
	const client = useQueryClient()
	return useMutation({
		mutationFn: ({ id, completed }: Pick<Goal, "id" | "completed">) =>
			api<Goal>(`/goals/${id}`, { method: "PATCH", body: JSON.stringify({ completed }) }),
		onSuccess: () => {
			client.invalidateQueries({ queryKey: ["goals"] })
			invalidate(client)
		},
	})
}
export function useCreateGoal() {
	const client = useQueryClient()
	return useMutation({
		mutationFn: (data: Pick<Goal, "title" | "category">) =>
			api<Goal>("/goals", { method: "POST", body: JSON.stringify(data) }),
		onSuccess: () => {
			client.invalidateQueries({ queryKey: ["goals"] })
			invalidate(client)
		},
	})
}
export function useCreateCaregiverResource() {
	const client = useQueryClient()
	return useMutation({
		mutationFn: (data: { category: string; title: string; summary: string; readTime: string }) =>
			api<Resource>("/resources", { method: "POST", body: JSON.stringify(data) }),
		onSuccess: () => client.invalidateQueries({ queryKey: ["resources"] }),
	})
}
export function useCreateCaregiverTask() {
	const client = useQueryClient()
	return useMutation({
		mutationFn: (data: { patientId: string; title: string }) =>
			api("/caregiver-support/tasks", { method: "POST", body: JSON.stringify(data) }),
		onSuccess: () => client.invalidateQueries({ queryKey: ["caregiver-support"] }),
	})
}
export function useToggleCaregiverTask() {
	const client = useQueryClient()
	return useMutation({
		mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
			api(`/caregiver-support/tasks/${id}`, { method: "PATCH", body: JSON.stringify({ completed }) }),
		onSuccess: () => client.invalidateQueries({ queryKey: ["caregiver-support"] }),
	})
}
export function useCreateCaregiverNote() {
	const client = useQueryClient()
	return useMutation({
		mutationFn: (data: { patientId: string; body: string }) =>
			api("/caregiver-support/notes", { method: "POST", body: JSON.stringify(data) }),
		onSuccess: () => client.invalidateQueries({ queryKey: ["caregiver-support"] }),
	})
}

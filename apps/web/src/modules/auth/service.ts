import { useMutation } from "@tanstack/react-query"
import { api } from "@/shared/utils/api"
import type { AuthResponse, LoginPayload, OnboardingPayload, SignupPayload } from "./interface"

export function useSignup() {
	return useMutation({
		mutationFn: (payload: SignupPayload) =>
			api<AuthResponse>("/auth/signup", { method: "POST", body: JSON.stringify(payload) }),
	})
}

export function useLogin() {
	return useMutation({
		mutationFn: (payload: LoginPayload) =>
			api<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
	})
}

export function useCompleteOnboarding() {
	return useMutation({
		mutationFn: (payload: OnboardingPayload) =>
			api<AuthResponse>("/auth/onboarding", { method: "POST", body: JSON.stringify(payload) }),
	})
}

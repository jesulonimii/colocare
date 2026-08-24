import { create } from "zustand"
import type { AuthResponse, User } from "./interface"

type AuthState = {
	token: string | null
	user: User | null
	setup: (data: AuthResponse) => void
	logout: () => void
}

const storageKey = "colocare-auth"
const saved = localStorage.getItem(storageKey)
let initial: AuthResponse | null = null
try {
	initial = saved ? (JSON.parse(saved) as AuthResponse) : null
} catch {
	localStorage.removeItem(storageKey)
}

export const useAuth = create<AuthState>((set) => ({
	token: initial?.token ?? null,
	user: initial?.user ?? null,
	setup: (data) => {
		localStorage.setItem(storageKey, JSON.stringify(data))
		set(data)
	},
	logout: () => {
		localStorage.removeItem(storageKey)
		set({ token: null, user: null })
	},
}))

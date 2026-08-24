import { create } from "zustand"

type WellnessState = { lastAssessmentAt: string | null; setLastAssessmentAt: () => void }

export const useWellnessStore = create<WellnessState>((set) => ({
	lastAssessmentAt: localStorage.getItem("colocare-assessment-at"),
	setLastAssessmentAt: () => {
		const timestamp = new Date().toISOString()
		localStorage.setItem("colocare-assessment-at", timestamp)
		set({ lastAssessmentAt: timestamp })
	},
}))

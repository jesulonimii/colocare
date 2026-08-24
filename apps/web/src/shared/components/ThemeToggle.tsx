import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

const key = "colocare-theme"

export function ThemeToggle() {
	const [dark, setDark] = useState(() => localStorage.getItem(key) === "dark")
	useEffect(() => {
		document.documentElement.classList.toggle("dark", dark)
		localStorage.setItem(key, dark ? "dark" : "light")
	}, [dark])
	return (
		<button
			type="button"
			aria-label={dark ? "Use light mode" : "Use dark mode"}
			onClick={() => setDark((value) => !value)}
			className="grid size-10 place-items-center rounded-xl border border-sage bg-white text-moss"
		>
			{dark ? <Sun size={18} /> : <Moon size={18} />}
		</button>
	)
}

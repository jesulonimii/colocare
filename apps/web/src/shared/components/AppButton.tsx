import type { ButtonHTMLAttributes, ReactNode } from "react"
export function AppButton({
	children,
	variant = "primary",
	className = "",
	...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
	children: ReactNode
	variant?: "primary" | "secondary"
	className?: string
}) {
	return (
		<button
			className={`cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-150 hover:opacity-85 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 ${variant === "primary" ? "bg-moss text-white" : "bg-sage text-moss"} ${className}`}
			{...props}
		>
			{children}
		</button>
	)
}

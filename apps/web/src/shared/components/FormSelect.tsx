import type { ReactNode, SelectHTMLAttributes } from "react"
import { Controller, useFormContext } from "react-hook-form"

export function FormSelect({
	name,
	label,
	children,
	className = "",
	...props
}: Omit<SelectHTMLAttributes<HTMLSelectElement>, "name"> & { name: string; label: string; children: ReactNode }) {
	const { control } = useFormContext()
	return (
		<div className={`block text-sm font-semibold text-ink ${className}`}>
			<label htmlFor={name}>{label}</label>
			<Controller
				control={control}
				name={name}
				render={({ field, fieldState }) => (
					<>
						<select
							{...props}
							{...field}
							id={name}
							className="mt-1.5 w-full rounded-xl border border-sage bg-white p-3 font-normal outline-none transition focus:border-moss focus:ring-2 focus:ring-sage"
						>
							{children}
						</select>
						{fieldState.error && (
							<span className="mt-1 block text-xs text-red-700">{fieldState.error.message}</span>
						)}
					</>
				)}
			/>
		</div>
	)
}

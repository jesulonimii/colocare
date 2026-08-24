import type { InputHTMLAttributes } from "react"
import { Controller, useFormContext } from "react-hook-form"

export function FormInput({
	name,
	label,
	hint,
	type,
	className = "",
	...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "name"> & { name: string; label: string; hint?: string }) {
	const { control } = useFormContext()
	return (
		<div className={`block text-sm font-semibold text-ink ${className}`}>
			<label htmlFor={name}>
				{label}
				{hint && <span className="ml-1 font-normal text-slate-500">{hint}</span>}
			</label>
			<Controller
				control={control}
				name={name}
				render={({ field, fieldState }) => (
					<>
						<input
							{...props}
							{...field}
							id={name}
							type={type}
							value={field.value ?? ""}
							onChange={(event) => field.onChange(type === "number" ? event.target.valueAsNumber : event)}
							aria-invalid={Boolean(fieldState.error)}
							className={`mt-1.5 w-full rounded-xl border bg-white p-3 font-normal outline-none transition focus:ring-2 ${fieldState.error ? "border-red-500 focus:border-red-600 focus:ring-red-100" : "border-sage focus:border-moss focus:ring-sage"}`}
						/>
						{fieldState.error && (
							<span className="mt-1 block text-xs text-red-700">{fieldState.error.message}</span>
						)}
					</>
				)}
			/>
		</div>
	)
}

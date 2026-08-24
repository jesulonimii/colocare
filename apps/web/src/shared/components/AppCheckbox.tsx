import type { InputHTMLAttributes, ReactNode } from "react"
import { Controller, useFormContext } from "react-hook-form"

export function AppCheckbox({
	name,
	children,
	...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "name"> & { name: string; children: ReactNode }) {
	const { control } = useFormContext()
	return (
		<div className="flex gap-2 text-sm leading-5 text-ink">
			<Controller
				control={control}
				name={name}
				render={({ field }) => (
					<input
						{...props}
						aria-describedby={`${name}-description`}
						checked={Boolean(field.value)}
						onChange={(event) => field.onChange(event.target.checked)}
						type="checkbox"
						className="mt-1 size-4 shrink-0 accent-[#2d6a4f]"
					/>
				)}
			/>
			<span id={`${name}-description`}>{children}</span>
		</div>
	)
}

import type { FormHTMLAttributes, ReactNode } from "react"
import { type FieldValues, FormProvider, type UseFormReturn } from "react-hook-form"

type Props<T extends FieldValues> = FormHTMLAttributes<HTMLFormElement> & {
	form: UseFormReturn<T>
	children: ReactNode
}

export function FormView<T extends FieldValues>({ form, children, ...props }: Props<T>) {
	return (
		<FormProvider {...form}>
			<form {...props}>{children}</form>
		</FormProvider>
	)
}

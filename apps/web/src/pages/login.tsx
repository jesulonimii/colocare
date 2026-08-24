import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Navigate, useNavigate } from "react-router-dom"
import { z } from "zod"
import type { LoginPayload, SignupPayload } from "@/modules/auth/interface"
import { signupSchema } from "@/modules/auth/schema"
import { useLogin, useSignup } from "@/modules/auth/service"
import { useAuth } from "@/modules/auth/store"
import { AppButton } from "@/shared/components/AppButton"
import { FormInput } from "@/shared/components/FormInput"
import { FormView } from "@/shared/components/FormView"
import { ThemeToggle } from "@/shared/components/ThemeToggle"

type AuthForm = Omit<SignupPayload, "name"> & { name?: string }
export default function Login() {
	const auth = useAuth()
	const navigate = useNavigate()
	const [isRegistering, setIsRegistering] = useState(true)
	const signup = useSignup()
	const login = useLogin()
	const form = useForm<AuthForm>({
		resolver: zodResolver(signupSchema.extend({ name: signupSchema.shape.name.optional().or(z.literal("")) })),
		defaultValues: { name: "", email: "", password: "" },
	})
	const mutation = isRegistering ? signup : login
	if (auth.token) return <Navigate to={auth.user?.role === "pending" ? "/onboarding" : "/dashboard"} replace />
	const submit = form.handleSubmit(
		async (values) => {
			form.clearErrors("root")
			if (isRegistering && !values.name) {
				form.setError("name", { message: "Enter your name" })
				return
			}
			try {
				const result = await (isRegistering
					? signup.mutateAsync(values as SignupPayload)
					: login.mutateAsync(values as LoginPayload))
				auth.setup(result)
				navigate(result.user.role === "pending" ? "/onboarding" : "/dashboard")
			} catch (error) {
				const message = error instanceof Error ? error.message : "We could not sign you in. Please try again."
				form.setError(isRegistering && message.includes("email") ? "email" : "root", { message })
			}
		},
		() => form.setError("root", { message: "Please correct the fields below and try again." })
	)
	return (
		<main className="relative grid min-h-screen place-items-center bg-mist p-5">
			<div className="absolute top-5 right-5">
				<ThemeToggle />
			</div>
			<FormView onSubmit={submit} form={form} className="w-full max-w-md rounded-3xl bg-white p-7 shadow-sm">
				<p className="text-sm font-bold tracking-wider text-moss uppercase">ColoCare</p>
				<h1 className="mt-2 text-3xl font-bold">{isRegistering ? "Create your account" : "Welcome back"}</h1>
				<p className="mt-2 text-sm text-slate-600">
					{isRegistering
						? "Start with your name, email, and password. We’ll guide you through onboarding next."
						: "Sign in to continue."}
				</p>
				<div className="mt-6 space-y-4">
					{isRegistering && <FormInput name="name" label="Name" />}
					<FormInput name="email" label="Email" type="email" />
					<FormInput name="password" label="Password" type="password" />
				</div>
				{form.formState.errors.root && (
					<p role="alert" className="mt-3 text-sm text-red-700">
						{form.formState.errors.root.message}
					</p>
				)}
				<AppButton type="submit" className="mt-5 w-full" disabled={mutation.isPending}>
					{mutation.isPending ? "Please wait…" : isRegistering ? "Create account" : "Sign in"}
				</AppButton>
				<button
					type="button"
					className="mt-4 w-full text-sm font-semibold text-moss"
					onClick={() => {
						setIsRegistering((value) => !value)
						form.reset()
						signup.reset()
						login.reset()
					}}
				>
					{isRegistering ? "Already have an account? Sign in" : "Need an account? Register"}
				</button>
			</FormView>
		</main>
	)
}

import type { FastifyInstance } from "fastify"
import { requireAuth } from "../../auth.js"
import { AuthSchema } from "./auth.dto.js"
import { completeOnboarding, type getUser, login, signup } from "./auth.service.js"

export async function authRoutes(app: FastifyInstance) {
	const replyWithToken = async (user: Awaited<ReturnType<typeof getUser>>) => ({
		user,
		token: app.jwt.sign({ sub: user!.id, role: user!.role }),
	})
	app.post("/signup", async (request, reply) => {
		try {
			return replyWithToken(await signup(AuthSchema.signup.parse(request.body)))
		} catch {
			return reply.status(409).send({ message: "An account with this email already exists." })
		}
	})
	app.post("/login", async (request, reply) => {
		const user = await login(AuthSchema.login.parse(request.body))
		if (!user) return reply.status(401).send({ message: "Incorrect email or password." })
		return replyWithToken(user)
	})
	app.post("/onboarding", async (request, reply) => {
		const user = await completeOnboarding(
			(await requireAuth(request)).userId,
			AuthSchema.onboarding.parse(request.body)
		)
		if (!user) return reply.status(401).send({ message: "Your session has expired. Please sign in again." })
		return replyWithToken(user)
	})
}

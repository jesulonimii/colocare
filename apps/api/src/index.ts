import cors from "@fastify/cors"
import jwt from "@fastify/jwt"
import Fastify from "fastify"
import { ZodError } from "zod"
import { authRoutes } from "./modules/auth/auth.routes.js"
import { startAchievementWorker } from "./modules/wellness/achievement.queue.js"
import { wellnessRoutes } from "./modules/wellness/wellness.routes.js"

const app = Fastify({
	logger:
		process.env.NODE_ENV === "production"
			? true
			: { transport: { target: "pino-pretty", options: { translateTime: "HH:MM:ss", ignore: "pid,hostname" } } },
})
await app.register(cors, { origin: true })
await app.register(jwt, { secret: process.env.JWT_SECRET ?? "colocare-local-demo-secret" })

app.setErrorHandler((error, _request, reply) => {
	if (error instanceof ZodError)
		return reply.status(400).send({ message: "Please check the form fields.", issues: error.issues })
	if (typeof error === "object" && error !== null && "statusCode" in error && error.statusCode === 401)
		return reply.status(401).send({ message: "Invalid or expired access token." })
	app.log.error(error)
	return reply.status(500).send({ message: "Something went wrong." })
})

app.get("/health", () => ({ status: "ok", service: "ColoCare API" }))
await app.register(authRoutes, { prefix: "/api/auth" })
await app.register(wellnessRoutes, { prefix: "/api" })
startAchievementWorker()

await app.listen({ host: "0.0.0.0", port: Number(process.env.PORT ?? 3001) })

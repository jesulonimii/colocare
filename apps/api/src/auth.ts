import type { FastifyRequest } from "fastify"
import type { UserRole } from "./modules/auth/auth.service.js"
export type AuthContext = { userId: string; role: UserRole }
export async function requireAuth(request: FastifyRequest) {
	await request.jwtVerify()
	const user = request.user as { sub: string; role: UserRole }
	return { userId: user.sub, role: user.role }
}

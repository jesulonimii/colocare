import { randomUUID } from "node:crypto"
import { Queue, Worker } from "bullmq"
import { sql } from "kysely"
import { db } from "../../database/index.js"
import { createNextWeeklyPlan } from "./wellness.service.js"

const connection = { host: process.env.REDIS_HOST ?? "localhost", port: 6379 }
const queue = new Queue("weekly-achievements", { connection })
const asDate = (value: string) => new Date(`${value}T00:00:00.000Z`)
const startOfWeek = (date = new Date()) => {
	const value = new Date(date)
	value.setDate(value.getDate() - ((value.getDay() + 6) % 7))
	return value.toISOString().slice(0, 10)
}

export const queueWeeklyAchievement = (userId: string) =>
	queue.add(
		"aggregate",
		{ userId },
		{ jobId: `${userId}-${startOfWeek()}`, removeOnComplete: true, removeOnFail: 20 }
	)

export const queueWeeklyPlan = (userId: string) => {
	const next = new Date(`${startOfWeek()}T00:00:00Z`)
	next.setUTCDate(next.getUTCDate() + 7)
	return queue.add(
		"create-next-plan",
		{ userId, weekStart: startOfWeek() },
		{
			jobId: `${userId}-plan-${next.toISOString().slice(0, 10)}`,
			delay: Math.max(0, next.getTime() - Date.now()),
			removeOnComplete: true,
			removeOnFail: 20,
		}
	)
}

export const startAchievementWorker = () =>
	new Worker(
		"weekly-achievements",
		async (job) => {
			if (job.name === "create-next-plan") return createNextWeeklyPlan(job.data.userId, job.data.weekStart)
			const weekStart = startOfWeek()
			const weekEnd = new Date(`${weekStart}T00:00:00Z`)
			weekEnd.setDate(weekEnd.getDate() + 7)
			const end = weekEnd.toISOString().slice(0, 10)
			const [logs, actions] = await Promise.all([
				db
					.selectFrom("dailyAssessments")
					.select("logDate")
					.where("userId", "=", job.data.userId)
					.where("logDate", ">=", asDate(weekStart))
					.where("logDate", "<", asDate(end))
					.execute(),
				db
					.selectFrom("weeklyPlanActionLogs")
					.select("status")
					.where("userId", "=", job.data.userId)
					.where("actionDate", ">=", asDate(weekStart))
					.where("actionDate", "<", asDate(end))
					.execute(),
			])
			const completedActions = actions.filter((action) => action.status === "completed").length
			const skippedActions = actions.filter((action) => action.status === "skipped").length
			const totalActions = actions.length - skippedActions
			const score = Math.round(
				(logs.length / 7) * 50 + (totalActions ? (completedActions / totalActions) * 50 : 0)
			)
			await db
				.insertInto("weeklyAchievements")
				.values({
					id: randomUUID(),
					userId: job.data.userId,
					weekStart,
					loggedDays: logs.length,
					completedActions,
					skippedActions,
					totalActions,
					score,
				})
				.onConflict((conflict) =>
					conflict.columns(["userId", "weekStart"]).doUpdateSet({
						loggedDays: logs.length,
						completedActions,
						skippedActions,
						totalActions,
						score,
						updatedAt: sql`now()`,
					})
				)
				.execute()
		},
		{ connection }
	)

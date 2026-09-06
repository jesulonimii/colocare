import { defineConfig } from "kysely-ctl"
import { db } from "../src/database/index.js"

export default defineConfig({
	kysely: db,
	migrations: { migrationFolder: "migrations" },
	seeds: { seedFolder: "seeds" },
})

import { fileURLToPath, URL } from "node:url"
import generouted from "@generouted/react-router/plugin"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
	plugins: [react(), tailwindcss(), generouted({ output: "./src/shared/router.ts" })],
	resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
	server: { port: 5173, proxy: { "/api": process.env.API_PROXY_TARGET ?? "http://localhost:3001" } },
})

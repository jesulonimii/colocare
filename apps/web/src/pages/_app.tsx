import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Outlet } from "react-router-dom"

const client = new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } } })
export default function RootLayout() {
	return (
		<QueryClientProvider client={client}>
			<Outlet />
		</QueryClientProvider>
	)
}

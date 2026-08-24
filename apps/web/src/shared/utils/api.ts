export async function api<T>(path: string, init?: RequestInit): Promise<T> {
	let token: string | null = null
	try {
		token = localStorage.getItem("colocare-auth")
			? (JSON.parse(localStorage.getItem("colocare-auth")!).token ?? null)
			: null
	} catch {
		localStorage.removeItem("colocare-auth")
	}
	const response = await fetch(`/api${path}`, {
		headers: {
			"content-type": "application/json",
			...(token ? { authorization: `Bearer ${token}` } : {}),
			...init?.headers,
		},
		...init,
	})
	if (response.status === 401 && !path.startsWith("/auth/")) {
		localStorage.removeItem("colocare-auth")
		window.location.assign("/login")
	}
	if (!response.ok)
		throw new Error((await response.json().catch(() => null))?.message ?? "Could not complete that request.")
	return response.json() as Promise<T>
}

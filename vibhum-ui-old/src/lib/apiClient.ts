import { client } from "@/client/client.gen"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000"

export function setupApiClient() {
    client.setConfig({
        baseUrl: BACKEND_URL,
    })
}

export function setApiToken(token: string) {
    client.interceptors.request.use((request) => {
        request.headers.set("Authorization", `Bearer ${token}`)
        return request
    })
}

import { cookies } from "next/headers"

export async function getServerAccessToken() {
    const cookieStore = await cookies()
    return cookieStore.get("oss_token")?.value
}

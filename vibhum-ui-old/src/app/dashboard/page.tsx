import { getServerAccessToken } from "@/lib/auth/server"
import { redirect } from "next/navigation"
import DashboardClient from "./dashboard-client"

export default async function DashboardPage() {
    const token = await getServerAccessToken()
    
    if (!token) {
        redirect("/login")
    }

    // Pass token to client component
    return <DashboardClient token={token} />
}

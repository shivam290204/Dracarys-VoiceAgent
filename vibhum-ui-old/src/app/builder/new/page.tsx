import { getServerAccessToken } from "@/lib/auth/server"
import { redirect } from "next/navigation"
import NewAgentForm from "./new-agent-form"

export default async function NewAgentPage() {
    const token = await getServerAccessToken()
    
    if (!token) {
        redirect("/login")
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-2xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Create New Agent</h1>
                    <p className="mt-2 text-gray-600">Give your agent a name, voice, and objective.</p>
                </div>
                <div className="rounded-xl bg-white p-6 shadow-sm border">
                    <NewAgentForm token={token} />
                </div>
            </div>
        </div>
    )
}

"use client"

import { useEffect, useState } from "react"
import { getWorkflowsApiV1WorkflowFetchGet } from "@/client/sdk.gen"
import { setupApiClient, setApiToken } from "@/lib/apiClient"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function DashboardClient({ token }: { token: string }) {
    const [workflows, setWorkflows] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        setupApiClient()
        setApiToken(token)
        
        async function fetchWorkflows() {
            try {
                const response = await getWorkflowsApiV1WorkflowFetchGet()
                if (response.data) {
                    setWorkflows(response.data)
                }
            } catch (error) {
                console.error("Failed to fetch workflows:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchWorkflows()
    }, [token])

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-5xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Agents</h1>
                        <p className="mt-2 text-gray-600">Manage your AI voice agents here.</p>
                    </div>
                    <Button onClick={() => router.push("/builder/new")}>
                        + Create Agent
                    </Button>
                </div>

                {loading ? (
                    <div className="text-center py-10">Loading agents...</div>
                ) : workflows.length === 0 ? (
                    <div className="rounded-xl bg-white p-12 text-center shadow-sm">
                        <h3 className="text-lg font-medium text-gray-900">No agents yet</h3>
                        <p className="mt-2 text-gray-500">Get started by creating a new AI agent.</p>
                        <Button className="mt-6" onClick={() => router.push("/builder/new")}>
                            Create your first agent
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {workflows.map((workflow) => (
                            <div key={workflow.uuid} className="rounded-xl bg-white p-6 shadow-sm border hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/builder/${workflow.uuid}`)}>
                                <h3 className="text-xl font-semibold text-gray-900">{workflow.name}</h3>
                                <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                                    {workflow.description || "No description provided."}
                                </p>
                                <div className="mt-4 flex justify-between items-center text-xs text-gray-400">
                                    <span>{new Date(workflow.created_at).toLocaleDateString()}</span>
                                    <span className="capitalize px-2 py-1 bg-blue-50 text-blue-600 rounded-full">{workflow.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

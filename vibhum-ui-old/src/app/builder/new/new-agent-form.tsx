"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createWorkflowApiV1WorkflowCreateDefinitionPost, getVoicesApiV1UserConfigurationsVoicesProviderGet } from "@/client/sdk.gen"
import { setupApiClient, setApiToken } from "@/lib/apiClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export default function NewAgentForm({ token }: { token: string }) {
    const [name, setName] = useState("")
    const [voice, setVoice] = useState("")
    const [objective, setObjective] = useState("")
    const [voices, setVoices] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        setupApiClient()
        setApiToken(token)

        async function fetchVoices() {
            try {
                // Fetching Cartesia or ElevenLabs voices. For simplicity let's use cartesia as default.
                const response = await getVoicesApiV1UserConfigurationsVoicesProviderGet({
                    path: { provider: "cartesia" }
                })
                if (response.data) {
                    setVoices(response.data)
                    if (response.data.length > 0) {
                        setVoice(response.data[0].id)
                    }
                }
            } catch (error) {
                console.error("Failed to fetch voices:", error)
            }
        }
        fetchVoices()
    }, [token])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Construct a basic workflow definition
        const workflowDefinition = {
            nodes: [
                {
                    id: "start-node",
                    type: "start",
                    position: { x: 100, y: 100 },
                    data: {
                        prompt: objective
                    }
                }
            ],
            edges: [],
            model_configuration_overrides: {
                tts_provider: "cartesia",
                cartesia: {
                    voice_id: voice
                }
            }
        }

        try {
            const response = await createWorkflowApiV1WorkflowCreateDefinitionPost({
                body: {
                    name,
                    workflow_definition: workflowDefinition
                }
            })
            if (response.data) {
                toast.success("Agent created successfully!")
                router.push("/dashboard")
            } else {
                toast.error("Failed to create agent")
            }
        } catch (error) {
            console.error(error)
            toast.error("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <Label htmlFor="name">Agent Name</Label>
                <Input
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1"
                    placeholder="e.g. Sales Assistant"
                />
            </div>
            
            <div>
                <Label htmlFor="voice">Voice Profile</Label>
                <select
                    id="voice"
                    required
                    value={voice}
                    onChange={(e) => setVoice(e.target.value)}
                    className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                    {voices.map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                    {voices.length === 0 && <option value="">Loading voices...</option>}
                </select>
            </div>

            <div>
                <Label htmlFor="objective">Main Objective</Label>
                <Textarea
                    id="objective"
                    required
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    className="mt-1 h-32"
                    placeholder="You are an AI assistant that helps users..."
                />
                <p className="mt-1 text-xs text-gray-500">
                    Describe what the agent should do and how it should behave.
                </p>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
                <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading || voices.length === 0}>
                    {loading ? "Creating..." : "Create Agent"}
                </Button>
            </div>
        </form>
    )
}

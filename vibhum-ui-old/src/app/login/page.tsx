"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { loginApiV1AuthLoginPost } from "@/client/sdk.gen"
import { setupApiClient } from "@/lib/apiClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { login } from "./actions"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setupApiClient()

        try {
            // Note: The OpenAPI backend expects x-www-form-urlencoded format for OAuth2
            // Our generated SDK handles this using formData format or application/x-www-form-urlencoded
            const response = await loginApiV1AuthLoginPost({
                body: {
                    username: email,
                    password: password
                }
            })
            
            if (response.data) {
                // We use a Server Action to set the HttpOnly cookie
                await login(response.data.access_token)
                toast.success("Login successful!")
                router.push("/dashboard")
            } else if (response.error) {
                toast.error("Invalid credentials")
            }
        } catch (error) {
            console.error("Login error:", error)
            toast.error("Failed to login")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                        Sign in to Vibhum
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Manage your voice agents easily.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <Label htmlFor="email-address">Email address</Label>
                            <Input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1"
                                placeholder="Email address"
                            />
                        </div>
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    <div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Signing in..." : "Sign in"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

"use server"

import { cookies } from "next/headers"

export async function login(token: string) {
    const cookieStore = await cookies()
    cookieStore.set("oss_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7 // 1 week
    })
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete("oss_token")
}

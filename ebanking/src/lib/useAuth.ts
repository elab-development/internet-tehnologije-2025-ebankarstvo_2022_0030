"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function useAuthGuard() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        ; (async () => {
            const res = await fetch("/api/auth/me")
            if (!res.ok) {
                router.push("/login")
                return
            }
            setLoading(false)
        })()
    }, [router])

    return { loading }
}
"use client"

import Button from "@/components/Button"
import Input from "@/components/Input"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
    const router = useRouter()

    const [email, setEmail] = useState("test@example.com")
    const [password, setPassword] = useState("12345678")
    const [err, setErr] = useState("")
    const [loading, setLoading] = useState(false)

    const submit = async () => {
        setErr("")
        setLoading(true)

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            })

            const data = await res.json().catch(() => ({}))

            if (!res.ok) {
                setErr(data?.error ?? "Login failed.")
                return
            }

            const meRes = await fetch("/api/auth/me")
            const meData = await meRes.json().catch(() => ({}))

            if (meRes.ok && meData?.user?.role === "ADMIN") {
                router.push("/admin/approvals")
            } else {
                router.push("/")
            }
            router.refresh()
        } catch {
            setErr("Network error.")
        } finally {
            setLoading(false)
        }
    }
    return (
        <main className="min-h-screen bg-slate-950">
            <div className="mx-auto flex max-w-6xl items-center px-6 py-5">
                <div className="flex items-center gap-3 text-white">
                    <Image src="/icon.png" alt="Icon" width={44} height={44} priority />
                    <div className="leading-tight">
                        <div className="text-sm font-semibold tracking-wide">E-BANK</div>
                        <div className="text-xs text-white/70">Internet banking</div>
                    </div>
                </div>
            </div>

            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 pb-10 pt-2 lg:grid-cols-2 lg:items-stretch">
                <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                    <div className="relative h-[320px] w-full lg:h-full lg:min-h-[560px]">
                        <Image src="/background.png" alt="Hero" fill className="object-cover" priority />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/10" />
                    </div>
                </section>

                <section className="flex items-center lg:justify-end">
                    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white p-7 shadow-xl">
                        <div className="mb-6">
                            <h2 className="mt-6 text-xl font-semibold text-slate-900">
                                Log in
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Enter your e-mail and password.
                            </p>

                        </div>

                        <div className="flex flex-col gap-4">
                            <Input label="E-mail" value={email} onChange={setEmail} placeholder="test@example.com" />
                            <Input label="Password" value={password} onChange={setPassword} placeholder="••••••••" type="password" />
                            {err ? <p className="text-sm text-red-600">{err}</p> : null}
                            <Button onClick={submit} disabled={loading}>
                                {loading ? "Logging in..." : "Log in"}
                            </Button>
                        </div>
                        <p className="mt-2 text-sm text-slate-500">
                            Don't have an account?{" "}
                            <a href="/register" className="font-medium text-indigo-600 hover:underline"> Register here. </a>
                        </p>
                    </div>
                </section>
            </div>
        </main>
    )
}
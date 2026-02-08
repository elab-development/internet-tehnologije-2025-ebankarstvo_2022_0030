"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AppShell from "@/components/AppShell"

type UserRow = {
    userId: string
    name: string
    email: string
    phone: string
    role: "USER" | "ADMIN"
    userStatus: "UNREGISTERED" | "ENABLED" | "DISABLED"
}

export default function AdminApprovalsPage() {
    const router = useRouter()
    const [rows, setRows] = useState<UserRow[]>([])
    const [loading, setLoading] = useState(true)
    const [err, setErr] = useState("")

    const load = async () => {
        setErr("")
        setLoading(true)

        const meRes = await fetch("/api/auth/me")
        const meData = await meRes.json().catch(() => ({}))
        if (!meRes.ok) {
            router.push("/login")
            router.refresh()
            return
        }
        if (meData?.user?.role !== "ADMIN") {
            router.push("/")
            router.refresh()
            return
        }

        const res = await fetch("/api/admin/users")
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
            setErr(data?.error ?? "Failed to load users.")
            setLoading(false)
            return
        }

        const all: UserRow[] = data.users ?? []
        const pending = all.filter((u) => u.userStatus === "UNREGISTERED" && u.role === "USER")
        setRows(pending)
        setLoading(false)
    }

    useEffect(() => {
        load()
    }, [])

    const approve = async (u: UserRow) => {
        setErr("")
        const res = await fetch(`/api/admin/approvals/${u.userId}`, { method: "PATCH" })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
            setErr(data?.error ?? "Approval failed.")
            return
        }
        await load()
    }

    return (
        <AppShell>
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-slate-900">Registration approvals</h1>

                <button
                    onClick={load}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                    Refresh
                </button>
            </div>

            <p className="mt-2 text-sm text-slate-600">
                Registered users waiting for approval.
            </p>

            {err ? <p className="mt-3 text-sm text-red-600">{err}</p> : null}

            {loading ? (
                <div className="mt-6 text-sm text-slate-500">Loading...</div>
            ) : (
                <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Name</th>
                                <th className="px-4 py-3 text-left font-medium">Email</th>
                                <th className="px-4 py-3 text-left font-medium">Phone</th>
                                <th className="px-4 py-3 text-left font-medium">Status</th>
                                <th className="px-4 py-3 text-right font-medium">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {rows.map((u) => (
                                <tr key={u.userId} className="border-t border-slate-100">
                                    <td className="px-4 py-3">{u.name}</td>
                                    <td className="px-4 py-3">{u.email}</td>
                                    <td className="px-4 py-3">{u.phone}</td>
                                    <td className="px-4 py-3">{u.userStatus}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => approve(u)}
                                                className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                                            >
                                                Approve
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-6 text-slate-500">
                                        No users for approval.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            )}
        </AppShell>
    )
}
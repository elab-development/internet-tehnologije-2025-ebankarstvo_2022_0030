"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AppShell from "@/components/AppShell"

type UserRow = {
  userId: string
  name: string
  email: string
  phone: string
  address: string | null
  birthDate: string
  gender: string
  role: "USER" | "ADMIN"
  userStatus: "ENABLED" | "DISABLED" | "UNREGISTERED"
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [rows, setRows] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState("")
  const [meId, setMeId] = useState<string>("")

  const load = async () => {
    setErr("")
    setLoading(true)

    const meRes = await fetch("/api/auth/me")
    const meData = await meRes.json().catch(() => ({}))

    setMeId(meData?.user?.userId ?? "")

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
    const onlyManaged = all.filter((u) => u.userStatus !== "UNREGISTERED")
    setRows(onlyManaged)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const toggleStatus = async (u: UserRow) => {
    setErr("")

    if (u.userStatus === "UNREGISTERED") {
      setErr("UNREGISTERED users can be approved only by admin.")
      return
    }

    const next: "ENABLED" | "DISABLED" = u.userStatus === "ENABLED" ? "DISABLED" : "ENABLED"

    const res = await fetch(`/api/admin/users/${u.userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userStatus: next }),
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      setErr(data?.error ?? "Failed to update userStatus.")
      return
    }

    await load()
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
        <button
          onClick={load}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >Refresh
        </button>
      </div>

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
                <th className="px-4 py-3 text-left font-medium">Role</th>
                <th className="px-4 py-3 text-left font-medium">User status</th>
                <th className="px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((u) => (
                <tr key={u.userId} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-600">{u.name}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3 text-slate-600">{u.role}</td>
                  <td className="px-4 py-3 text-slate-600">{u.userStatus}</td>
                  <td className="px-4 py-3 text-slate-600">
                    <div className="flex justify-end">
                      <button
                        disabled={u.userId === meId}
                        onClick={() => toggleStatus(u)}
                        className={[
                          "rounded-lg px-3 py-2 text-xs font-semibold text-white",
                          u.userStatus === "ENABLED" ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700",
                          u.userId === meId ? "opacity-50 cursor-not-allowed hover:opacity-50" : "",
                        ].join(" ")}
                      >{u.userId === meId ? "You" : (u.userStatus === "ENABLED" ? "Disable" : "Enable")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-slate-500">No users.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  )
}

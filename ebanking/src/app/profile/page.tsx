"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AppShell from "@/components/AppShell"

type Me = {
  userId: string
  name: string
  email: string
  phone: string
  address: string | null
  birthDate: string
  gender: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [me, setMe] = useState<Me | null>(null)
  const [err, setErr] = useState("")

  useEffect(() => {
    ;(async () => {
      const res = await fetch("/api/auth/me")
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        router.push("/login")
        router.refresh()
        return
      }
      setMe(data.user)
    })()
  }, [router])

  return (
    <AppShell>
      <h1 className="text-xl font-semibold">Profile</h1>
      {err ? <p className="mt-3 text-red-600">{err}</p> : null}

      {!me ? (
        <div className="mt-6 text-sm text-slate-500">Loading...</div>
      ) : (
        <div className="mt-6 max-w-xl rounded-xl border bg-white p-5 text-sm">
          <p><span className="text-slate-500">Name:</span> {me.name}</p>
          <p className="mt-1"><span className="text-slate-500">Email:</span> {me.email}</p>
          <p className="mt-1"><span className="text-slate-500">Phone:</span> {me.phone}</p>
          <p className="mt-1"><span className="text-slate-500">Address:</span> {me.address ?? "-"}</p>
          <p className="mt-1"><span className="text-slate-500">Birth date:</span> {me.birthDate}</p>
          <p className="mt-1"><span className="text-slate-500">Gender:</span> {me.gender}</p>
        </div>
      )}
    </AppShell>
  )
}
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
    ; (async () => {
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
      <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
      {err ? <p className="mt-3 text-red-600">{err}</p> : null}

      {!me ? (
        <div className="mt-6 text-sm text-slate-500">Loading...</div>
      ) : (
        <div className="mt-6 max-w-xl rounded-xl border bg-white p-5 text-sm">
          <p>
            <span className="text-slate-600 font-medium">Name:</span>{" "}
            <span className="text-slate-900">{me.name}</span>
          </p>
          <p className="mt-1">
            <span className="text-slate-600 font-medium">Email:</span>{" "}
            <span className="text-slate-900">{me.email}</span>
          </p>
          <p className="mt-1">
            <span className="text-slate-600 font-medium">Phone:</span>{" "}
            <span className="text-slate-900">{me.phone}</span>
          </p>
          <p className="mt-1">
            <span className="text-slate-600 font-medium">Address:</span>{" "}
            <span className="text-slate-900">{me.address}</span>
          </p>
          <p className="mt-1">
            <span className="text-slate-600 font-medium">Birth date:</span>{" "}
            <span className="text-slate-900">{me.birthDate}</span>
          </p>
          <p className="mt-1">
            <span className="text-slate-600 font-medium">Gender:</span>{" "}
            <span className="text-slate-900">{me.gender}</span>
          </p>
        </div>
      )}
    </AppShell>
  )
}
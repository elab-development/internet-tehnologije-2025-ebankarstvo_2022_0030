"use client"

import { useRouter } from "next/navigation"
import Button from "@/components/Button"

export default function Topbar() {
  const router = useRouter()

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <img src="/icon.png" alt="Logo" className="h-10 w-10" />
          <div className="leading-tight">
            <div className="text-sm font-semibold text-slate-900">E-Banking</div>
            <div className="text-xs text-slate-500">Internet banking</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={logout}>Logout</Button>
        </div>
      </div>
    </div>
  )
}

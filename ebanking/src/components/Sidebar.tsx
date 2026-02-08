"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

type MeUser = {
  role: "USER" | "ADMIN"
} | null

const userItems = [
  { href: "/", label: "Home" },
  { href: "/accounts", label: "Accounts" },
  { href: "/profile", label: "Profile" },
]

const adminOnlyItems = [
  { href: "/admin/approvals", label: "Registration approvals" },
  { href: "/admin/users", label: "Users" },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [me, setMe] = useState<MeUser>(null)

  useEffect(() => {
    ; (async () => {
      const res = await fetch("/api/auth/me")
      if (!res.ok) {
        setMe(null)
        return
      }
      const data = await res.json().catch(() => ({}))
      setMe(data?.user ?? null)
    })()
  }, [])

  const items = me?.role === "ADMIN" ? adminOnlyItems : userItems

  return (
    <aside className="w-56 shrink-0 border-r bg-slate-900 text-white">
      <nav className="flex flex-col gap-1 p-3">
        {items.map((it) => {
          const active = pathname === it.href
          return (
            <Link
              key={it.href}
              href={it.href}
              className={[
                "rounded-lg px-3 py-2 text-sm font-medium",
                active ? "bg-white/15" : "hover:bg-white/10",
              ].join(" ")}
            >
              {it.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

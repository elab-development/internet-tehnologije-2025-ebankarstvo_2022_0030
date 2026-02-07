"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const items = [
    { href: "/", label: "Home" },
    { href: "/accounts", label: "Accounts" },
    { href: "/profile", label: "Profile" },
]

export default function Sidebar() {
    const pathname = usePathname()

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

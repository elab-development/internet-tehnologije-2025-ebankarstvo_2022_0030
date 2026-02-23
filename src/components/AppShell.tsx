"use client"

import { ReactNode } from "react"
import Topbar from "./Topbar"
import Sidebar from "./Sidebar"

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Topbar />
      <div className="mx-auto flex max-w-7xl">
        <Sidebar />
        <div className="flex-1 px-6 py-6">{children}</div>
      </div>
    </div>
  )
}

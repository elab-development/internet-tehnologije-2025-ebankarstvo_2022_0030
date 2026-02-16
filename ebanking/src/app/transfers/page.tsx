import { Suspense } from "react"
import TransfersClient from "./TransfersClient"

export default function TransfersPage() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-600">Loading...</div>}>
      <TransfersClient />
    </Suspense>
  )
}
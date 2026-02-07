"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AppShell from "@/components/AppShell"
import AccountCarousel from "@/components/AccountCarousel"
import Input from "@/components/Input"
import Button from "@/components/Button"

type ApiAccount = {
  accountId: string
  number: string
  accountType: string
  status: string
  openingDate: string
  userId: string
  balances: { balanceId: string; currency: string; amount: string; accountId: string }[]
}

type ApiTransaction = {
  transactionId: string
  date: string
  description: string | null
  fromCurrency: string
  toCurrency: string
  amountFrom: string
  amountTo: string
  category: string
  senderAccountId: string
  receiverAccountId: string
}

const CATEGORIES = ["ALL","FOOD","FUEL","RENT","BILLS","SHOPPING","ENTERTAINMENT","HEALTH","TRANSPORT","OTHER"] as const

export default function AccountsPage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<ApiAccount[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [tab, setTab] = useState<"details" | "history">("details")

  const [q, setQ] = useState("")
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("ALL")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [txs, setTxs] = useState<ApiTransaction[]>([])
  const [err, setErr] = useState("")

  const selectedAccount = accounts[selectedIndex]

  useEffect(() => {
    ;(async () => {
      const me = await fetch("/api/auth/me")
      if (!me.ok) {
        router.push("/login")
        router.refresh()
        return
      }
      const aRes = await fetch("/api/accounts")
      const aData = await aRes.json().catch(() => ({}))
      if (!aRes.ok) return setErr(aData?.error ?? "Failed to load accounts.")
      setAccounts(aData.accounts ?? [])
    })()
  }, [router])

  const loadHistory = async () => {
    if (!selectedAccount) return

    const params = new URLSearchParams()
    params.set("accountId", selectedAccount.accountId)
    params.set("limit", "50")
    if (q.trim()) params.set("q", q.trim())
    if (category !== "ALL") params.set("category", category)
    if (from) params.set("from", from)
    if (to) params.set("to", to)

    const tRes = await fetch(`/api/transactions?${params.toString()}`)
    const tData = await tRes.json().catch(() => ({}))
    if (!tRes.ok) return setErr(tData?.error ?? "Failed to load transactions.")
    setTxs(tData.transactions ?? [])
  }

  useEffect(() => {
    if (tab !== "history") return
    loadHistory()
  }, [tab, selectedAccount?.accountId])

  return (
    <AppShell>
      {err ? <p className="mb-4 text-red-600">{err}</p> : null}

      <AccountCarousel
        accounts={accounts.map((a) => ({
          accountId: a.accountId,
          number: a.number,
          status: a.status,
          accountType: a.accountType,
          balances: a.balances.map((b) => ({ currency: b.currency, amount: b.amount })),
        }))}
        selectedIndex={Math.min(selectedIndex, Math.max(accounts.length - 1, 0))}
        onChangeIndex={(i) => {
          setSelectedIndex(i)
          setTab("details")
        }}
      />

      {/* Tabs */}
      <div className="mt-6 flex gap-2">
        <button
          className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === "details" ? "bg-slate-900 text-white" : "bg-white border"}`}
          onClick={() => setTab("details")}
        >
          Account details
        </button>
        <button
          className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === "history" ? "bg-slate-900 text-white" : "bg-white border"}`}
          onClick={() => setTab("history")}
        >
          Transaction history
        </button>
      </div>

      {/* Details */}
      {tab === "details" && selectedAccount ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-white p-5">
            <h3 className="font-semibold">Account details</h3>
            <div className="mt-4 text-sm text-slate-700">
              <p><span className="text-slate-500">Account number:</span> {selectedAccount.number}</p>
              <p className="mt-1"><span className="text-slate-500">Status:</span> {selectedAccount.status}</p>
              <p className="mt-1"><span className="text-slate-500">Type:</span> {selectedAccount.accountType}</p>
              <p className="mt-1"><span className="text-slate-500">Opening date:</span> {selectedAccount.openingDate}</p>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <h3 className="font-semibold">Spending (graphs)</h3>
            <p className="mt-2 text-sm text-slate-500">
              Sledeći korak: ovde ubacujemo grafove (monthly/quarterly/yearly) preko `/api/analytics/spending?accountId=...`
            </p>
          </div>
        </div>
      ) : null}

      {/* History */}
      {tab === "history" && selectedAccount ? (
        <div className="mt-6 rounded-xl border bg-white p-5">
          <h3 className="font-semibold">Transaction history</h3>

          <div className="mt-4 grid gap-3 lg:grid-cols-4">
            <Input label="Search" value={q} onChange={setQ} placeholder="npr. Rucak" />
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-slate-700">Category</span>
              <select
                className="rounded-lg border border-slate-200 px-3 py-2"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <Input label="From (YYYY-MM-DD)" value={from} onChange={setFrom} placeholder="2026-02-01" />
            <Input label="To (YYYY-MM-DD)" value={to} onChange={setTo} placeholder="2026-02-28" />
          </div>

          <div className="mt-4">
            <Button onClick={loadHistory}>Apply filters</Button>
          </div>

          <div className="mt-5 rounded-lg border">
            {txs.length === 0 ? (
              <div className="p-5 text-sm text-slate-500">No transactions.</div>
            ) : (
              <div className="divide-y">
                {txs.map((t) => (
                  <div key={t.transactionId} className="flex items-center justify-between gap-6 p-4">
                    <div>
                      <div className="font-medium">{t.description ?? "Credit transfer"}</div>
                      <div className="mt-1 text-sm text-slate-500">{t.date} • {t.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{t.amountFrom} {t.fromCurrency}</div>
                      <div className="text-sm text-slate-500">→ {t.amountTo} {t.toCurrency}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </AppShell>
  )
}

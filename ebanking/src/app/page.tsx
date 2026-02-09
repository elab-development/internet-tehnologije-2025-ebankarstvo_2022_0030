"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AppShell from "@/components/AppShell"
import AccountCarousel from "@/components/AccountCarousel"
import Button from "@/components/Button"
import { formatDateSR } from "@/lib/date"

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
  receiverAccountNumber: string
}

export default function HomePage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<ApiAccount[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [txs, setTxs] = useState<ApiTransaction[]>([])
  const [err, setErr] = useState("")

  const selectedAccount = accounts[selectedIndex]

  useEffect(() => {
    ; (async () => {
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

  useEffect(() => {
    if (!selectedAccount) return
      ; (async () => {
        const tRes = await fetch(`/api/transactions?limit=10&accountId=${selectedAccount.accountId}`)
        const tData = await tRes.json().catch(() => ({}))
        if (!tRes.ok) return setErr(tData?.error ?? "Failed to load transactions.")
        setTxs(tData.transactions ?? [])
      })()
  }, [selectedAccount?.accountId])

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
        onChangeIndex={setSelectedIndex}
      />

      <div className="mt-6 flex items-center justify-start">
        <Button onClick={() => router.push("/transfers")}>Transfer funds</Button>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">Latest transactions</h2>

        <div className="mt-4 rounded-xl border bg-white">
          {txs.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">No transactions.</div>
          ) : (
            <div className="divide-y">
              {txs.map((t) => (
                <div key={t.transactionId} className="flex items-center justify-between gap-6 p-4">
                  <div>
                    <div className="font-medium text-slate-900">{t.description ?? "Credit transfer"}</div>
                    <div className="mt-1 text-sm text-slate-500">
                      {formatDateSR(t.date)} • {t.category} • Receiver: {t.receiverAccountNumber}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-slate-900">
                      {t.amountFrom} {t.fromCurrency}
                    </div>
                    <div className="text-sm text-slate-500">
                      → {t.amountTo} {t.toCurrency}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </AppShell>
  )
}
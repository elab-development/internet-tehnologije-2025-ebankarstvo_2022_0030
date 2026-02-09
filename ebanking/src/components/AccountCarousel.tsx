"use client"

import { useEffect, useMemo, useState } from "react"
import Button from "./Button"

type AccountCard = {
  accountId: string
  number: string
  status: string
  accountType: string
  balances: { currency: string; amount: string }[]
}

export default function AccountCarousel({
  accounts,
  selectedIndex,
  onChangeIndex,
}: {
  accounts: AccountCard[]
  selectedIndex: number
  onChangeIndex: (i: number) => void
}) {
  const safeAccounts = accounts ?? []
  const len = safeAccounts.length

  const safeIndex = len === 0 ? 0 : Math.min(Math.max(selectedIndex, 0), len - 1)

  const a: AccountCard =
    len === 0
      ? {
        accountId: "",
        number: "",
        status: "",
        accountType: "",
        balances: [{ currency: "RSD", amount: "0.00" }],
      }
      : safeAccounts[safeIndex]

  const currencies = useMemo(() => {
    const list = (a.balances ?? []).map((b) => b.currency)
    return list.length ? list : ["RSD"]
  }, [a.accountId, a.balances])

  const [selectedCurrency, setSelectedCurrency] = useState<string>("RSD")

  useEffect(() => {
    const nextCur = currencies.includes("RSD") ? "RSD" : currencies[0]
    setSelectedCurrency(nextCur)
  }, [a.accountId, currencies])

  const bal = a.balances.find((b) => b.currency === selectedCurrency) ?? a.balances[0]

  const prev = () => {
    if (len < 2) return
    onChangeIndex((safeIndex - 1 + len) % len)
  }

  const next = () => {
    if (len < 2) return
    onChangeIndex((safeIndex + 1) % len)
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-800 text-white">
      <div className="absolute inset-0 opacity-30">
        <img src="/carousel.jpg" alt="" className="h-full w-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-slate-900/10" />

      <div className="relative flex items-center justify-between gap-4 p-6">
        <Button onClick={prev} disabled={len < 2}>
          ◀
        </Button>

        <div className="w-full max-w-xl rounded-2xl bg-slate-900/40 p-6 backdrop-blur">
          {len === 0 ? (
            <div className="text-sm text-white/80">No accounts yet.</div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-center gap-3">
                  <img src="/account.png" alt="Logo" className="h-10 w-10" />
                </div>

                <div className="text-right">
                  <div className="text-sm font-semibold">ACCOUNT</div>
                  <div className="text-xs text-white/80">{a.number}</div>
                  <div className="text-xs text-white/70">{a.status}</div>
                </div>
              </div>

              <div className="mt-6 flex items-end justify-between gap-6">
                <div>
                  <div className="text-sm text-white/85">Available balance</div>

                  <div className="mt-1 flex items-end gap-3">
                    <div className="text-3xl font-bold">{bal?.amount ?? "0.00"}</div>

                    {currencies.length > 1 ? (
                      <select
                        value={selectedCurrency}
                        onChange={(e) => setSelectedCurrency(e.target.value)}
                        className="mb-1 rounded-md border border-white/20 bg-white/10 px-2 py-1 text-xs font-semibold text-white outline-none"
                      >
                        {currencies.map((c) => (
                          <option key={c} value={c} className="text-slate-900">
                            {c}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="mb-1 text-xs font-semibold text-white/80">
                        {bal?.currency ?? ""}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right text-xs text-white/70">{a.accountType}</div>
              </div>
            </>
          )}
        </div>

        <Button onClick={next} disabled={len < 2}>
          ▶
        </Button>
      </div>
    </div>
  )
}

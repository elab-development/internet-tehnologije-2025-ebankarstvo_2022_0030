"use client"

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
  const prev = () => onChangeIndex((selectedIndex - 1 + accounts.length) % accounts.length)
  const next = () => onChangeIndex((selectedIndex + 1) % accounts.length)

  if (accounts.length === 0) return null

  const a = accounts[selectedIndex]
  const rsd = a.balances.find((b) => b.currency === "RSD") ?? a.balances[0]

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-800 text-white">
      <div className="absolute inset-0 opacity-30">
        <img src="/background.png" alt="" className="h-full w-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-slate-900/10" />

      <div className="relative flex items-center justify-between gap-4 p-6">
        <Button onClick={prev} disabled={accounts.length < 2}>
          ◀
        </Button>

        <div className="w-full max-w-xl rounded-2xl bg-slate-900/40 p-6 backdrop-blur">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src="/icon.png" alt="Logo" className="h-10 w-10" />
              <div className="text-xs text-white/70">1921</div>
            </div>

            <div className="text-right">
              <div className="text-sm font-semibold">{/* owner name later */}ACCOUNT</div>
              <div className="text-xs text-white/80">{a.number}</div>
              <div className="text-xs text-white/70">{a.status}</div>
            </div>
          </div>

          <div className="mt-6 flex items-end justify-between gap-6">
            <div>
              <div className="text-sm text-white/85">Available balance</div>
              <div className="mt-1 text-3xl font-bold">
                {rsd ? rsd.amount : "0.00"}
                <span className="ml-2 text-sm font-semibold text-white/80">{rsd?.currency ?? ""}</span>
              </div>
            </div>

            <div className="text-right text-xs text-white/70">
              {a.accountType}
            </div>
          </div>
        </div>

        <Button onClick={next} disabled={accounts.length < 2}>
          ▶
        </Button>
      </div>
    </div>
  )
}

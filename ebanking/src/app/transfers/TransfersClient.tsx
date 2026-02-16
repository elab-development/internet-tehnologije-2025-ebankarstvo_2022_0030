"use client"

import AppShell from "@/components/AppShell"
import Button from "@/components/Button"
import Input from "@/components/Input"
import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { formatDateSR } from "@/lib/date"

type ApiBalance = {
  balanceId: string
  currency: string
  amount: string
  accountId: string
}

type ApiAccount = {
  accountId: string
  number: string
  accountType: string
  status: string
  openingDate: string
  userId: string
  balances: ApiBalance[]
}

type Me = {
  userId: string
  name: string
  email: string
  phone: string
  address: string | null
  birthDate: string
  gender: string
}

const CATEGORIES = [
  "FOOD",
  "FUEL",
  "RENT",
  "BILLS",
  "SHOPPING",
  "ENTERTAINMENT",
  "HEALTH",
  "TRANSPORT",
  "OTHER",
] as const

type Category = (typeof CATEGORIES)[number]

function todayISO(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

function to2(amount: string): string {
  const n = Number(amount)
  if (Number.isNaN(n)) return "0.00"
  return n.toFixed(2)
}

function pickBalance(account: ApiAccount | undefined, currency: string): string {
  if (!account) return "0.00"
  const b = account.balances.find((x) => x.currency === currency)
  return b?.amount ?? "0.00"
}

export default function TransfersClient() {
  const router = useRouter()
  const sp = useSearchParams()
  const senderFromUrl = sp.get("sender") ?? ""

  const [me, setMe] = useState<Me | null>(null)
  const [accounts, setAccounts] = useState<ApiAccount[]>([])
  const [senderAccountId, setSenderAccountId] = useState<string>("")
  const [payerName, setPayerName] = useState("")
  const [receiverName, setReceiverName] = useState("")
  const [receiverAccountNumber, setReceiverAccountNumber] = useState("")
  const [receiverAccountId, setReceiverAccountId] = useState<string>("")
  const [receiverCurrencies, setReceiverCurrencies] = useState<string[]>([])
  const [receiverDefaultCurrency, setReceiverDefaultCurrency] = useState<string>("")
  const [currency, setCurrency] = useState("RSD")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState<Category>("FOOD")
  const [description, setDescription] = useState("")
  const [valueDate] = useState(todayISO())
  const [lookupMsg, setLookupMsg] = useState("")
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)
  const [creditorLocked, setCreditorLocked] = useState(false)

  const senderAccount = useMemo(
    () => accounts.find((a) => a.accountId === senderAccountId),
    [accounts, senderAccountId]
  )

  const senderCurrencies = useMemo(() => {
    const set = new Set<string>()
    ;(senderAccount?.balances ?? []).forEach((b) => set.add(b.currency))
    const list = [...set]
    return list.length ? list : ["RSD"]
  }, [senderAccount])

  const senderAvailable = useMemo(() => {
    return to2(pickBalance(senderAccount, currency))
  }, [senderAccount, currency])

  useEffect(() => {
    ;(async () => {
      setErr("")
      const meRes = await fetch("/api/auth/me")
      const meData = await meRes.json().catch(() => ({}))
      if (!meRes.ok) {
        router.push("/login")
        router.refresh()
        return
      }
      setMe(meData.user as Me)
      setPayerName((meData.user as Me)?.name ?? "")

      const aRes = await fetch("/api/accounts")
      const aData = await aRes.json().catch(() => ({}))
      if (!aRes.ok) {
        setErr(aData?.error ?? "Failed to load accounts.")
        return
      }

      const list: ApiAccount[] = aData.accounts ?? []
      setAccounts(list)

      const initialSender =
        (senderFromUrl && list.some((a) => a.accountId === senderFromUrl) && senderFromUrl) ||
        list[0]?.accountId ||
        ""
      setSenderAccountId(initialSender)

      const acc = list.find((a) => a.accountId === initialSender)
      const firstCur = acc?.balances?.[0]?.currency ?? "RSD"
      setCurrency(firstCur)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const lookupReceiver = async () => {
    setLookupMsg("")
    setReceiverAccountId("")
    setReceiverCurrencies([])
    setReceiverDefaultCurrency("")
    setCreditorLocked(false)

    const num = receiverAccountNumber.trim()
    if (!num) {
      setLookupMsg("Enter receiver account number.")
      return
    }

    try {
      const res = await fetch(`/api/accounts/lookup?number=${encodeURIComponent(num)}`)
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setLookupMsg(data?.error ?? "No accounts found.")
        setReceiverName("")
        setCreditorLocked(false)
        return
      }

      if (!data.account) {
        setLookupMsg("Account not found.")
        setReceiverName("")
        setCreditorLocked(false)
        return
      }

      setReceiverAccountId(data.account.accountId)
      setReceiverCurrencies(Array.isArray(data.account.currencies) ? data.account.currencies : [])
      setReceiverDefaultCurrency(typeof data.account.defaultCurrency === "string" ? data.account.defaultCurrency : "")
      setReceiverName((data.account.ownerName ?? data.account.name ?? "").toString())
      setCreditorLocked(true)
      setLookupMsg(`Account found: ${data.account.number}`)
    } catch {
      setLookupMsg("Network error.")
    }
  }

  const conversionNote = useMemo(() => {
    if (!receiverAccountId) return ""
    if (!receiverCurrencies.length) return ""
    if (!receiverDefaultCurrency) return ""

    if (!receiverCurrencies.includes(currency))
      return `Receiver does not have ${currency} - conversion to ${receiverDefaultCurrency} will be executed according to today's course.`

    return ""
  }, [receiverAccountId, receiverCurrencies, receiverDefaultCurrency, currency])

  const submit = async () => {
    setErr("")
    setLoading(true)

    try {
      if (!senderAccountId) {
        setErr("Sender account not chosen.")
        return
      }

      if (!receiverAccountId) {
        setErr("Receiver account not found (Lookup).")
        return
      }

      if (!amount || Number(amount) <= 0) {
        setErr("Enter a valid amount.")
        return
      }

      if (!valueDate) {
        setErr("Enter date.")
        return
      }

      const toCurrency = receiverCurrencies.includes(currency) ? currency : receiverDefaultCurrency || currency

      const payload = {
        senderAccountId,
        receiverAccountId,
        fromCurrency: currency,
        toCurrency,
        amountFrom: to2(amount),
        category,
        description: description.trim() ? description.trim() : null,
        date: valueDate,
      }

      const res = await fetch("/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErr(data?.error ?? "Transfer failed.")
        return
      }

      router.push("/")
      router.refresh()
    } catch {
      setErr("Network error.")
    } finally {
      setLoading(false)
    }
  }

  return (
          <AppShell>
              <div className="max-w-5xl">
                  <h1 className="text-xl font-semibold text-slate-900">Transfer funds</h1>
                  {err ? <p className="mt-3 text-sm text-red-600">{err}</p> : null}
                  <div className="mt-6">
                      <div className="text-sm font-semibold text-slate-700">Debtor account</div>
  
                      <div className="mt-3 flex flex-col gap-3 rounded-xl bg-slate-900 p-4 text-white shadow">
                          <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                  <div className="relative h-9 w-9 overflow-hidden rounded bg-white/10">
                                      <Image src="/icon.png" alt="icon" fill className="object-contain p-1" />
                                  </div>
                                  <div className="leading-tight">
                                      <div className="text-xs text-white/70">{me?.name ?? "USER"}</div>
                                      <div className="text-sm font-semibold">{senderAccount?.number ?? "—"}</div>
                                  </div>
                              </div>
  
                              <div className="text-right">
                                  <div className="text-xs text-white/70">Available balance</div>
                                  <div className="mt-1 flex items-center justify-end gap-2">
                                      <div className="text-2xl font-bold">{senderAvailable}</div>
                                      <select
                                          className="rounded-md border border-white/20 bg-white/10 px-2 py-1 text-xs text-white outline-none"
                                          value={currency}
                                          onChange={(e) => setCurrency(e.target.value)}
                                      > {senderCurrencies.map((c) => (
                                          <option key={c} value={c} className="text-slate-900">{c}</option>
                                      ))}
                                      </select>
                                  </div>
                              </div>
                          </div>
  
                          <div className="mt-2">
                              <label className="text-xs font-semibold text-white/70">Change debtor account</label>
                              <select
                                  className="mt-2 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                                  value={senderAccountId}
                                  onChange={(e) => {
                                      const id = e.target.value
                                      setSenderAccountId(id)
                                      const acc = accounts.find((a) => a.accountId === id)
                                      const firstCur = acc?.balances?.[0]?.currency ?? "RSD"
                                      setCurrency(firstCur)
                                  }}
                              >
                                  {accounts.map((a) => (
                                      <option key={a.accountId} value={a.accountId} className="text-slate-900">
                                          {a.number} • {a.accountType}
                                      </option>
                                  ))}
                              </select>
                          </div>
                      </div>
                  </div>
  
                  <div className="mt-6 rounded-xl border bg-white p-6">
                      <div className="text-sm font-semibold text-slate-700">Payer</div>
                      <div className="mt-3 grid gap-4 lg:grid-cols-2">
                          <Input label="Name" value={payerName} onChange={setPayerName} disabled={true} />
                          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                              <div className="text-xs font-semibold text-slate-500">Debtor account</div>
                              <div className="mt-1 font-medium text-slate-900">{senderAccount?.number ?? "—"}</div>
                          </div>
                      </div>
  
                      <div className="mt-6 text-sm font-semibold text-slate-700">Creditor data</div>
                      <div className="mt-3 grid gap-4 lg:grid-cols-2">
                          <Input
                              label="Creditor name"
                              value={receiverName}
                              onChange={setReceiverName}
                              placeholder="Look up an account to fill."
                              disabled={true}
                          />
  
                          <div className="flex flex-col gap-2">
                              <Input
                                  label="Beneficiary account number"
                                  value={receiverAccountNumber}
                                  onChange={(v) => {
                                      setReceiverAccountNumber(v)
                                      setReceiverAccountId("")
                                      setReceiverCurrencies([])
                                      setReceiverDefaultCurrency("")
                                      setLookupMsg("")
                                      setReceiverName("")
                                      setCreditorLocked(false)
                                  }}
                                  placeholder="XXXXXXXXXXXXXXXXXXXXXX"
                              />
  
                              <div className="flex items-center gap-3">
                                  <button
                                      type="button"
                                      onClick={lookupReceiver}
                                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                                  >Look up
                                  </button>
                                  <div className="text-sm text-slate-600">
                                      {receiverAccountId ? (
                                          <span className="font-semibold text-emerald-700">Receiver OK</span>
                                      ) : (
                                          <span className="text-slate-500">Receiver not selected</span>
                                      )}
                                      {lookupMsg ? <span className="ml-2 text-slate-500">• {lookupMsg}</span> : null}
                                  </div>
                              </div>
  
                              {conversionNote ? (
                                  <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                                      {conversionNote}
                                  </div>
                              ) : null}
                          </div>
                      </div>
  
                      <div className="mt-6 text-sm font-semibold text-slate-700">Details</div>
                      <div className="mt-3 grid gap-4 lg:grid-cols-3">
                          <Input label="Amount" value={amount} onChange={setAmount} placeholder="1000.00" />
  
                          <label className="flex flex-col gap-1">
                              <span className="text-sm font-medium text-slate-700">Currency</span>
                              <select
                                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-600"
                                  value={currency}
                                  onChange={(e) => setCurrency(e.target.value)}
                              >{senderCurrencies.map((c) => (
                                  <option key={c} value={c}>
                                      {c}
                                  </option>
                              ))}
                              </select>
                          </label>
  
                          <label className="flex flex-col gap-1">
                              <span className="text-sm font-medium text-slate-700">Category</span>
                              <select
                                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-600"
                                  value={category}
                                  onChange={(e) => setCategory(e.target.value as Category)}
                              >
                                  {CATEGORIES.map((c) => (
                                      <option key={c} value={c} className="text-slate-900">
                                          {c}
                                      </option>
                                  ))}
                              </select>
                          </label>
                      </div>
  
                      <div className="mt-6 text-sm font-semibold text-slate-700">Transfer details</div>
                      <div className="mt-3">
                          <Input label="Description" value={description} onChange={setDescription} placeholder="" />
                      </div>
  
                      <div className="mt-6 text-sm font-semibold text-slate-700">Value date</div>
                      <div className="mt-3 grid gap-4 lg:grid-cols-2">
                          <input
                              value={formatDateSR(valueDate)}
                              readOnly
                              disabled
                              className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-700 outline-none"
                          />
  
                          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                              <div className="text-xs font-semibold text-slate-500">Summary</div>
                              <div className="mt-1 text-slate-900">
                                  {to2(amount || "0")} {currency} • {category}
                              </div>
                              <div className="mt-1 text-xs text-slate-500">
                                  from {senderAccount?.number ?? "—"} to {receiverAccountNumber || "—"}
                              </div>
                          </div>
                      </div>
  
                      <div className="mt-8 flex justify-center">
                          <Button onClick={submit} disabled={loading}>
                              {loading ? "Processing..." : "Transfer"}
                          </Button>
                      </div>
                  </div>
              </div>
          </AppShell>
      )
}

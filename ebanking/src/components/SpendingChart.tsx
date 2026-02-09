"use client"

import { useEffect, useMemo, useState } from "react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"

type Period = "monthly" | "quarterly" | "yearly"

type ApiPoint = { label: string; total: string }

type ApiResponse = { ok: true; currency: string; period: Period; points: ApiPoint[] }

type Props = {
  accountId: string
  currencies: string[]
  defaultCurrency?: string
}

function formatTotal(x: string) {
  const n = Number(x)
  if (!Number.isFinite(n)) return x
  return n.toFixed(2)
}

export default function SpendingChart({ accountId, currencies, defaultCurrency = "RSD" }: Props) {
  const [period, setPeriod] = useState<Period>("monthly")
  const [currency, setCurrency] = useState(defaultCurrency)
  const [points, setPoints] = useState<{ label: string; total: number }[]>([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")

  useEffect(() => {
    if (!accountId) return
    const list = Array.isArray(currencies) ? currencies : []
    const next = list.includes("RSD") ? "RSD" : (list[0] ?? defaultCurrency)
    setCurrency(next)
  }, [accountId, defaultCurrency, currencies])

  useEffect(() => {
    if (!accountId) return

      ; (async () => {
        setErr("")
        setLoading(true)
        try {
          const params = new URLSearchParams({
            accountId,
            period,
            currency,
          })

          const res = await fetch(`/api/analytics/spending?${params.toString()}`)
          const data = (await res.json().catch(() => ({}))) as Partial<ApiResponse> & { error?: string }

          if (!res.ok) {
            setErr(data.error ?? "Failed to load spending.")
            setPoints([])
            return
          }

          const rows = (data.points ?? []).map((p) => ({
            label: p.label,
            total: Number(p.total) || 0,
          }))

          setPoints(rows)
        } catch {
          setErr("Network error.")
          setPoints([])
        } finally {
          setLoading(false)
        }
      })()
  }, [accountId, period, currency])

  const hasData = points.length > 0

  const yTick = useMemo(
    () => (v: any) => (typeof v === "number" ? v.toFixed(0) : v),
    []
  )

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900">Spending</h3>

        <div className="flex items-center gap-2">
          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>

          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {(currencies?.length ? currencies : [defaultCurrency]).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

        </div>
      </div>

      <div className="mt-2 h-px w-full bg-slate-100" />

      {err ? <p className="mt-3 text-sm text-red-600">{err}</p> : null}
      {loading ? <p className="mt-3 text-sm text-slate-500">Loading…</p> : null}

      {!loading && !err && !hasData ? (
        <p className="mt-3 text-sm text-slate-500">No data for selected period.</p>
      ) : null}

      {hasData ? (
        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={points}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis tickFormatter={yTick} />
              <Tooltip
                formatter={(value: any) => [`${formatTotal(String(value))} ${currency}`, "Total"]}
              />
              <Bar dataKey="total" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </div>
  )
}

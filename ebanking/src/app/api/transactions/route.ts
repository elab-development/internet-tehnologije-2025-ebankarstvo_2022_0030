import { db } from "@/db"
import { accounts, transactions } from "@/db/schema"
import { COOKIE_NAME, verifyToken } from "@/lib/auth"
import { requireUser } from "@/lib/requireUser"
import { and, desc, eq, gte, ilike, inArray, lte, or, sql } from "drizzle-orm"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

function clampInt(v: string | null, def: number, min: number, max: number) {
  const n = v ? parseInt(v, 10) : NaN
  if (Number.isNaN(n)) return def
  return Math.min(Math.max(n, min), max)
}

function parseMoney(v: string | null): string | undefined {
  if (!v) return
  const s = v.trim()
  if (!s) return
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return
  return s
}

export async function GET(req: Request) {
  const guard = await requireUser()
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status })
  }

  const token = (await cookies()).get(COOKIE_NAME)?.value
  if (!token) {
    return NextResponse.json({ error: "Unathorized." }, { status: 401 })
  }

  let payload: { userId: string }
  try {
    payload = verifyToken(token) as { userId: string }
  } catch {
    return NextResponse.json({ error: "Invalid token." }, { status: 401 })
  }

  try {
    const url = new URL(req.url)

    const accountIdRaw = url.searchParams.get("accountId")
    const accountId = accountIdRaw && accountIdRaw.trim() ? accountIdRaw.trim() : undefined

    const limit = clampInt(url.searchParams.get("limit"), 50, 1, 200)

    const q = url.searchParams.get("q")?.trim() || undefined
    const category = url.searchParams.get("category")?.trim() || undefined
    const from = url.searchParams.get("from")?.trim() || undefined
    const to = url.searchParams.get("to")?.trim() || undefined
    const minAmount = parseMoney(url.searchParams.get("minAmount"))
    const maxAmount = parseMoney(url.searchParams.get("maxAmount"))

    const userAccounts = await db
      .select({ accountId: accounts.accountId })
      .from(accounts)
      .where(eq(accounts.userId, payload.userId))

    const ids = userAccounts.map((a) => a.accountId)
    if (ids.length === 0) {
      return NextResponse.json({ transactions: [] }, { status: 200 })
    }

    const conds: any[] = [
      or(inArray(transactions.senderAccountId, ids), inArray(transactions.receiverAccountId, ids)),
    ]

    if (accountId) {
      conds.push(or(eq(transactions.senderAccountId, accountId), eq(transactions.receiverAccountId, accountId)))
    }

    if (q) {
      conds.push(ilike(transactions.description, `%${q}%`))
    }

    if (category && category !== "ALL") {
      conds.push(eq(transactions.category as any, category as any))
    }

    if (from) conds.push(gte(transactions.date, from))
    if (to) conds.push(lte(transactions.date, to))

    if (minAmount) conds.push(gte(transactions.amountFrom, sql`${minAmount}`))
    if (maxAmount) conds.push(lte(transactions.amountFrom, sql`${maxAmount}`))

    const rows = await db
      .select()
      .from(transactions)
      .where(and(...conds))
      .orderBy(desc(transactions.date))
      .limit(limit)

    return NextResponse.json({ transactions: rows }, { status: 200 })
  } catch (e: any) {
    console.error("GET /api/transactions failed:", e)
    return NextResponse.json({ error: e?.message ?? "Failed to load transactions." }, { status: 500 })
  }
}

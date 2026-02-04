import { db } from "@/db"
import { accounts, transactions } from "@/db/schema"
import { COOKIE_NAME, verifyToken } from "@/lib/auth"
import { and, eq, gte, inArray, lte, sql } from "drizzle-orm"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

type Period = "monthly" | "quarterly" | "yearly"

function isPeriod(x: string): x is Period {
    return x === "monthly" || x === "quarterly" || x === "yearly"
}

function isDateStr(s: string): boolean {
    return /^\d{4}-\d{2}-\d{2}/.test(s)
}

export async function GET(req: Request) {
    const token = (await cookies()).get(COOKIE_NAME)?.value
    if (!token)
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

    let payload: { userId: string }
    try {
        payload = verifyToken(token)
    } catch {
        return NextResponse.json({ error: "Invalid token." }, { status: 401 })
    }

    const url = new URL(req.url)
    const periodRaw = url.searchParams.get("period") ?? "monthly"
    const from = url.searchParams.get("from") ?? undefined
    const to = url.searchParams.get("to") ?? undefined
    const currency = (url.searchParams.get("currency") ?? "RSD").toUpperCase()
    const accountId = url.searchParams.get("accountId") ?? undefined

    if (!isPeriod(periodRaw))
        return NextResponse.json({ error: "Invalid period." }, { status: 400 })

    const period: Period = periodRaw

    if (from && !isDateStr(from))
        return NextResponse.json({ error: "Invalid from date." }, { status: 400 })

    if (to && !isDateStr(to))
        return NextResponse.json({ error: "Invalid to date." }, { status: 400 })

    if (!/^[A-Z]{3}$/.test(currency)) {
        return NextResponse.json({ error: "Invalid currency" }, { status: 400 })
    }

    const userAccounts = await db
        .select({ accountId: accounts.accountId })
        .from(accounts)
        .where(eq(accounts.userId, payload.userId))

    const ids = userAccounts.map((a) => a.accountId)

    if (ids.length === 0)
        return NextResponse.json({ ok: true, points: [] })

    const conds: any[] = []

    conds.push(inArray(transactions.senderAccountId, ids))

    if (accountId)
        conds.push(eq(transactions.senderAccountId, accountId))

    if (from)
        conds.push(gte(transactions.date, from))

    if (to)
        conds.push(lte(transactions.date, to))

    conds.push(eq(transactions.fromCurrency, currency))

    let labelSql
    if (period === "monthly") {
        labelSql = sql<string>`to_char(${transactions.date}, 'YYYY-MM')`
    } else if (period === "yearly") {
        labelSql = sql<string>`to_char(${transactions.date}, 'YYYY')`
    } else {
        labelSql = sql<string>`concat(to_char(${transactions.date}, 'YYYY'), '-Q', extract(quarter from ${transactions.date}))`
    }

    const rows = await db
        .select({
            label: labelSql,
            total: sql<string>`coalesce(sum(${transactions.amountFrom}), 0)`
        })
        .from(transactions)
        .where(and(...conds))
        .groupBy(labelSql)
        .orderBy(labelSql)

    return NextResponse.json({ ok: true, currency, period, points: rows })
}

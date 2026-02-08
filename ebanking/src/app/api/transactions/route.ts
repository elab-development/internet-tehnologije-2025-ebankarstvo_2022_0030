import { db } from "@/db"
import { accounts, transactions } from "@/db/schema"
import { COOKIE_NAME, verifyToken } from "@/lib/auth"
import { requireUser } from "@/lib/requireUser"
import { and, eq, gte, ilike, inArray, lte, or } from "drizzle-orm"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

const CATEGORIES = [
    "FOOD", "FUEL", "RENT", "BILLS", "SHOPPING", "ENTERTAINMENT", "HEALTH", "TRANSPORT", "OTHER"
] as const

type Category = (typeof CATEGORIES)[number]

function isCategory(x: string): x is Category {
    return (CATEGORIES as readonly string[]).includes(x)
}

function isDateStr(s: string): boolean {
    return /^\d{4}-\d{2}-\d{2}/.test(s)
}

export async function GET(req: Request) {
    const guard = await requireUser()
    if (!guard.ok) 
        return NextResponse.json({ error: guard.error }, { status: guard.status })

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
    const from = url.searchParams.get("from") ?? undefined
    const to = url.searchParams.get("to") ?? undefined
    const q = url.searchParams.get("q") ?? undefined
    const categoryParam = url.searchParams.get("category") ?? undefined
    const accountId = url.searchParams.get("accountId") ?? undefined
    const limitRaw = url.searchParams.get("limit") ?? "50"

    let category: Category | undefined = undefined

    if (categoryParam) {
        if (!isCategory(categoryParam))
            return NextResponse.json({ error: "Invalid category" }, { status: 400 })
        category = categoryParam
    }

    const limit = Math.min(Math.max(parseInt(limitRaw, 10) || 50, 1), 200)

    if (from && !isDateStr(from))
        return NextResponse.json({ error: "Invalid from date." }, { status: 400 })

    if (to && !isDateStr(to))
        return NextResponse.json({ error: "Invalid to date." }, { status: 400 })

    if (category && !isCategory(category))
        return NextResponse.json({ error: "Invalid category." }, { status: 400 })

    const userAccounts = await db
        .select({ accountId: accounts.accountId })
        .from(accounts)
        .where(eq(accounts.userId, payload.userId))

    const ids = userAccounts.map((a) => a.accountId)

    if (ids.length === 0)
        return NextResponse.json({ ok: true, transactions: [] })

    const conds: any[] = []

    conds.push(
        or(
            inArray(transactions.senderAccountId, ids),
            inArray(transactions.receiverAccountId, ids),
        )
    )

    if (accountId) {
        conds.push(
            or(
                eq(transactions.senderAccountId, accountId),
                eq(transactions.receiverAccountId, accountId)
            )
        )
    }

    if (from)
        conds.push(gte(transactions.date, from))

    if (to)
        conds.push(lte(transactions.date, to))

    if (category)
        conds.push(eq(transactions.category, category))

    if (q)
        conds.push(ilike(transactions.description, `%${q}%`))

    const rows = await db
        .select()
        .from(transactions)
        .where(and(...conds))
        .orderBy(transactions.date)
        .limit(limit)

    return NextResponse.json({ ok: true, transactions: rows })
}
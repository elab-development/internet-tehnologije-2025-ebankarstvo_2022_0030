import { db } from "@/db";
import { accounts, balances } from "@/db/schema";
import { COOKIE_NAME, verifyToken } from "@/lib/auth";
import { eq, inArray } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const token = (await cookies()).get(COOKIE_NAME)?.value
    if (!token)
        return NextResponse.json({ error: "Unathourized." }, { status: 401 })

    let payload
    try {
        payload = verifyToken(token)
    } catch {
        return NextResponse.json({ error: "Invalid token." }, { status: 401 })
    }

    const userId = payload.userId
    const userAccounts = await db
        .select()
        .from(accounts)
        .where(eq(accounts.userId, userId))
    if (userAccounts.length === 0)
        return NextResponse.json({ accounts: [] })

    const accountIds = userAccounts.map((a) => a.accountId)
    const accountBalances = await db
        .select()
        .from(balances)
        .where(inArray(balances.accountId, accountIds))

    const result = userAccounts.map((acc) => ({
        ...acc,
        balances: accountBalances.filter(
            (b) => b.accountId === acc.accountId
        )
    }))

    return NextResponse.json({ accounts: result })
}
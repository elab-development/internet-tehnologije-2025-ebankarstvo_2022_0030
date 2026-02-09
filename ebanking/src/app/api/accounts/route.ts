import { db } from "@/db";
import { accounts, balances } from "@/db/schema";
import { COOKIE_NAME, verifyToken } from "@/lib/auth";
import { requireUser } from "@/lib/requireUser";
import { eq, inArray } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const guard = await requireUser()

    if (!guard.ok)
        return NextResponse.json({ error: guard.error }, { status: guard.status })

    const userId = guard.userId
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
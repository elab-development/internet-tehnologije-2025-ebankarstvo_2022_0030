import { NextResponse } from "next/server"
import { db } from "@/db"
import { accounts, balances, users } from "@/db/schema"
import { requireUser } from "@/lib/requireUser"
import { asc, eq } from "drizzle-orm"

export async function GET(req: Request) {
  const guard = await requireUser()
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status })
  }

  const url = new URL(req.url)
  const number = (url.searchParams.get("number") ?? "").trim()

  if (!number) {
    return NextResponse.json({ error: "Number is required." }, { status: 400 })
  }

  const rows = await db
    .select({
      accountId: accounts.accountId,
      number: accounts.number,
      accountType: accounts.accountType,
      status: accounts.status,
      userId: accounts.userId,
      ownerName: users.name,
    })
    .from(accounts)
    .leftJoin(users, eq(users.userId, accounts.userId))
    .where(eq(accounts.number, number))
    .limit(1)

  if (rows.length === 0) {
    return NextResponse.json({ account: null }, { status: 200 })
  }

  const acc = rows[0]

  const bs = await db
    .select({ currency: balances.currency })
    .from(balances)
    .where(eq(balances.accountId, acc.accountId))
    .orderBy(asc(balances.balanceId))

  const currencies = bs.map((b) => b.currency)
  const defaultCurrency = currencies[0] ?? null

  return NextResponse.json(
    {
      account: {
        ...acc,
        currencies,
        defaultCurrency,
      },
    },
    { status: 200 }
  )
}

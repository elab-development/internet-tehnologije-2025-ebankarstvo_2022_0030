import { db } from "@/db"
import { accounts, balances, exchangeRates, transactions } from "@/db/schema"
import { COOKIE_NAME, verifyToken } from "@/lib/auth"
import { requireUser } from "@/lib/requireUser"
import { and, eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

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
] as const;

type Category = (typeof CATEGORIES)[number];

type TransferBody = {
    senderAccountId: string,
    receiverAccountId: string,
    fromCurrency: string,
    toCurrency: string,
    amountFrom: string,
    category: string
    description?: string
}

function isCategory(x: string): x is Category {
    return (CATEGORIES as readonly string[]).includes(x);
}

function isValidAmount(value: string): boolean {
    return /^\d+(\.\d{1,2})?$/.test(value) && parseFloat(value) > 0
}

export async function POST(req: Request) {
    const guard = await requireUser()

    if (!guard.ok)
        return NextResponse.json({ error: guard.error }, { status: guard.status })

    let userId = guard.userId

    const body = (await req.json()) as Partial<TransferBody>
    const { senderAccountId, receiverAccountId, fromCurrency, toCurrency, amountFrom, category, description, } = body

    if (!senderAccountId || !receiverAccountId || !fromCurrency || !toCurrency || !amountFrom || !category)
        return NextResponse.json({ error: "Missing fields." }, { status: 400 })

    if (!isValidAmount(amountFrom))
        return NextResponse.json({ error: "Invalid amount." }, { status: 400 })

    if (senderAccountId === receiverAccountId)
        return NextResponse.json({ error: "Sender and receiver must be different." }, { status: 400 })

    if (!category || typeof category !== "string" || !isCategory(category))
        return NextResponse.json({ error: "Invalid category." }, { status: 400 });

    try {
        const result = await db.transaction(async (tx) => {
            const senderAccount = await tx
                .select()
                .from(accounts)
                .where(
                    and(
                        eq(accounts.accountId, senderAccountId),
                        eq(accounts.userId, userId)
                    )
                )

            if (senderAccount.length === 0)
                return { error: "Sender account not owned by user.", status: 400 }

            const senderBalance = await tx
                .select()
                .from(balances)
                .where(
                    and(
                        eq(balances.accountId, senderAccountId),
                        eq(balances.currency, fromCurrency)
                    )
                )

            if (senderBalance.length === 0)
                return { error: "No balance for currency.", status: 400 }

            const senderAmount = parseFloat(senderBalance[0].amount as string)
            const amountFromNum = parseFloat(amountFrom)

            if (senderAmount < amountFromNum)
                return { error: "Insufficient funds.", status: 400 }

            let exchangeRateId: string | null = null
            let amountToNum = amountFromNum

            if (fromCurrency !== toCurrency) {
                const today = new Date().toISOString().slice(0, 10)

                const getRsdBaseRate = async (quoteCurrency: string) => {
                    if (quoteCurrency === "RSD")
                        return { exchangeRateId: null as string | null, rate: 1 }

                    const rows = await tx
                        .select({ exchangeRateId: exchangeRates.exchangeRateId, rate: exchangeRates.rate })
                        .from(exchangeRates)
                        .where(
                            and(
                                eq(exchangeRates.rateDate, today),
                                eq(exchangeRates.baseCurrency, "RSD"),
                                eq(exchangeRates.quoteCurrency, quoteCurrency)
                            )
                        )

                    if (rows.length === 0) return null

                    return {
                        exchangeRateId: rows[0].exchangeRateId,
                        rate: parseFloat(rows[0].rate as string),
                    }
                }

                const rateFrom = await getRsdBaseRate(fromCurrency)
                const rateTo = await getRsdBaseRate(toCurrency)

                if (!rateFrom || !rateTo)
                    return { error: "Exchange rate not available", status: 503 }

                if (fromCurrency === "RSD") {
                    amountToNum = amountFromNum / rateTo.rate
                    exchangeRateId = rateTo.exchangeRateId
                } else if (toCurrency === "RSD") {
                    amountToNum = amountFromNum * rateFrom.rate
                    exchangeRateId = rateFrom.exchangeRateId
                } else {
                    amountToNum = (amountFromNum * rateFrom.rate) / rateTo.rate
                    exchangeRateId = rateFrom.exchangeRateId
                }
            }

            await tx
                .update(balances)
                .set({ amount: (senderAmount - amountFromNum).toFixed(2) })
                .where(eq(balances.balanceId, senderBalance[0].balanceId))

            const receiverBalance = await tx
                .select()
                .from(balances)
                .where(
                    and(
                        eq(balances.accountId, receiverAccountId),
                        eq(balances.currency, toCurrency)
                    )
                )

            if (receiverBalance.length === 0) {
                await tx.insert(balances).values({
                    accountId: receiverAccountId,
                    currency: toCurrency,
                    amount: amountToNum.toFixed(2)
                })
            } else {
                const current = parseFloat(receiverBalance[0].amount as string)
                await tx
                    .update(balances)
                    .set({ amount: (current + amountToNum).toFixed(2) })
                    .where(eq(balances.balanceId, receiverBalance[0].balanceId))
            }

            const today = new Date().toISOString().slice(0, 10)

            const [t] = await tx
                .insert(transactions)
                .values({
                    date: today,
                    senderAccountId,
                    receiverAccountId,
                    fromCurrency,
                    toCurrency,
                    amountFrom: amountFromNum.toFixed(2),
                    amountTo: amountToNum.toFixed(2),
                    category,
                    description: description ?? null,
                    exchangeRateId
                }).returning()

            return { transaction: t }
        })

        if ("error" in result)
            return NextResponse.json({ error: result.error }, { status: result.status })

        return NextResponse.json({ ok: true, transaction: result.transaction }, { status: 201 })
    } catch (e) {
        console.error(e)
        return NextResponse.json({ error: "Transfer failed." }, { status: 500 })
    }
}
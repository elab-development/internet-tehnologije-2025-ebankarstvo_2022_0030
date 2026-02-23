import { db } from "@/db"
import { exchangeRates } from "@/db/schema"
import { NextResponse } from "next/server"

type KursRate = {
    code: string,
    date: string,
    exchange_middle: number
}

type KursRateTodayResponse = {
    rates: KursRate[]
}

function parseCurrenciesList(): string[] {
    const raw = process.env.RATES_CURRENCIES ?? "EUR,USD"
    return raw.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean)
}

export async function GET(req: Request) {
    try {
        const auth = req.headers.get("authorization")

        if (auth !== `Bearer ${process.env.CRON_SECRET}`)
            return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

        const res = await fetch("https://kurs.resenje.org/api/v1/rates/today", { cache: "no-store" })

        if (!res.ok)
            return NextResponse.json({ error: "Failed to fetch rates.", status: res.status }, { status: 502 })

        const data = (await res.json()) as KursRateTodayResponse
        const wanted = new Set(parseCurrenciesList())
        const picked = data.rates.filter((r) => wanted.has(r.code))
        
        if (picked.length === 0)
            return NextResponse.json({ error: "No matching currencies found in response.", wanted: [...wanted] }, { status: 500 })

        const rows = picked.map((r) => ({
            rateDate: r.date,
            baseCurrency: "RSD",
            quoteCurrency: r.code,
            rate: r.exchange_middle.toString()
        }))

        await db
            .insert(exchangeRates)
            .values(rows)
            .onConflictDoNothing({
                target: [exchangeRates.rateDate, exchangeRates.baseCurrency, exchangeRates.quoteCurrency],
            })

        return NextResponse.json({
            ok: true,
            rateDate: rows[0].rateDate,
            insertedOrUpdated: rows.length,
            currencies: rows.map((x) => x.quoteCurrency)
        })
    } catch (e) {
        console.error("CRON RATES ERROR:", e)
        return NextResponse.json({ error: "CRON failed", details: String(e) }, { status: 500 })
    }
}
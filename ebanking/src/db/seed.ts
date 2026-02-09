import "dotenv/config"
import bcrypt from "bcrypt"
import { db } from "./index"
import { accounts, balances, exchangeRates, transactions, users } from "./schema"
import { sql } from "drizzle-orm"

type Currency = "RSD" | "EUR" | "USD" | "CHF" | "GBP" | "SEK"
type Category =
    | "FOOD"
    | "FUEL"
    | "RENT"
    | "BILLS"
    | "SHOPPING"
    | "ENTERTAINMENT"
    | "HEALTH"
    | "TRANSPORT"
    | "OTHER"

const DEFAULT_PASSWORD = "12345678"
const OPENING_DATE = "2026-02-01"
const RATE_DATE = "2026-02-09"

function d(iso: string) {
    return iso
}

function to2(n: number) {
    return n.toFixed(2)
}

async function main() {
    const salt = await bcrypt.genSalt(10)
    const hashed = await bcrypt.hash(DEFAULT_PASSWORD, salt)

    await db.insert(exchangeRates).values([
        { rateDate: RATE_DATE, baseCurrency: "RSD", quoteCurrency: "EUR", rate: "117.00" },
        { rateDate: RATE_DATE, baseCurrency: "RSD", quoteCurrency: "USD", rate: "108.00" },
        { rateDate: RATE_DATE, baseCurrency: "RSD", quoteCurrency: "CHF", rate: "124.50" },
        { rateDate: RATE_DATE, baseCurrency: "RSD", quoteCurrency: "GBP", rate: "137.20" },
        { rateDate: RATE_DATE, baseCurrency: "RSD", quoteCurrency: "SEK", rate: "10.40" },
    ])

    await db.insert(users).values([
        {
            name: "Uroš Kotaranin",
            birthDate: "1988-04-12",
            gender: "MALE",
            phone: "060 1111111",
            address: "Bulevar kralja Aleksandra 1, Beograd",
            email: "uros.kotaranin@bank.rs",
            salt,
            password: hashed,
            role: "ADMIN",
            userStatus: "ENABLED",
        },
        {
            name: "Maša Kotaranin",
            birthDate: "1991-09-03",
            gender: "FEMALE",
            phone: "060 2222222",
            address: "Nemanjina 10, Beograd",
            email: "masa.kotaranin@bank.rs",
            salt,
            password: hashed,
            role: "ADMIN",
            userStatus: "ENABLED",
        },
    ])

    const people = [
        {
            name: "Nikola Marković",
            birthDate: "2002-01-15",
            gender: "MALE",
            phone: "061 3001001",
            address: "Jove Ilića 154, Beograd",
            email: "nikola.markovic@bank.rs",
            checkingNo: "RS35105009999999990001",
            mcNo: "RS35105009999999991001",
            mcCurrencies: ["RSD", "EUR", "USD"] as Currency[],
            checkingRsd: "182450.00",
            mc: { RSD: "62500.00", EUR: "740.00", USD: "390.00" },
        },
        {
            name: "Ana Ilić",
            birthDate: "2001-06-22",
            gender: "FEMALE",
            phone: "061 3001002",
            address: "Cara Dušana 12, Novi Sad",
            email: "ana.ilic@bank.rs",
            checkingNo: "RS35105009999999990002",
            mcNo: "RS35105009999999991002",
            mcCurrencies: ["RSD", "EUR", "CHF"] as Currency[],
            checkingRsd: "156200.00",
            mc: { RSD: "80500.00", EUR: "520.00", CHF: "260.00" },
        },
        {
            name: "Vuk Janković",
            birthDate: "2000-11-02",
            gender: "MALE",
            phone: "061 3001003",
            address: "Kneza Miloša 25, Niš",
            email: "vuk.jankovic@bank.rs",
            checkingNo: "RS35105009999999990003",
            mcNo: "RS35105009999999991003",
            mcCurrencies: ["RSD", "USD", "GBP"] as Currency[],
            checkingRsd: "212900.00",
            mc: { RSD: "40200.00", USD: "510.00", GBP: "180.00" },
        },
        {
            name: "Marija Stojanović",
            birthDate: "2003-03-09",
            gender: "FEMALE",
            phone: "061 3001004",
            address: "Bulevar Oslobođenja 88, Kragujevac",
            email: "marija.stojanovic@bank.rs",
            checkingNo: "RS35105009999999990004",
            mcNo: "RS35105009999999991004",
            mcCurrencies: ["RSD", "EUR", "SEK"] as Currency[],
            checkingRsd: "141300.00",
            mc: { RSD: "91000.00", EUR: "330.00", SEK: "6400.00" },
        },
        {
            name: "Luka Pavlović",
            birthDate: "2002-08-18",
            gender: "MALE",
            phone: "061 3001005",
            address: "Gandijeva 7, Novi Beograd",
            email: "luka.pavlovic@bank.rs",
            checkingNo: "RS35105009999999990005",
            mcNo: "RS35105009999999991005",
            mcCurrencies: ["RSD", "USD", "CHF"] as Currency[],
            checkingRsd: "169750.00",
            mc: { RSD: "55500.00", USD: "280.00", CHF: "310.00" },
        },
    ] as const

    const acc: Record<string, { checkingId: string; mcId: string }> = {}

    for (const p of people) {
        const [u] = await db
            .insert(users)
            .values({
                name: p.name,
                birthDate: p.birthDate,
                gender: p.gender,
                phone: p.phone,
                address: p.address,
                email: p.email,
                salt,
                password: hashed,
                role: "USER",
                userStatus: "ENABLED",
            })
            .returning()

        const [checking] = await db
            .insert(accounts)
            .values({
                number: p.checkingNo,
                accountType: "CHECKING",
                status: "ACTIVE",
                openingDate: OPENING_DATE,
                userId: u.userId,
            })
            .returning()

        const [mc] = await db
            .insert(accounts)
            .values({
                number: p.mcNo,
                accountType: "MULTICURRENCY",
                status: "ACTIVE",
                openingDate: OPENING_DATE,
                userId: u.userId,
            })
            .returning()

        acc[p.email] = { checkingId: checking.accountId, mcId: mc.accountId }

        await db.insert(balances).values({
            accountId: checking.accountId,
            currency: "RSD",
            amount: p.checkingRsd,
        })

        const mcRows = Object.entries(p.mc).map(([currency, amount]) => ({
            accountId: mc.accountId,
            currency: currency as Currency,
            amount: amount as string,
        }))

        await db.insert(balances).values(mcRows)
    }

    const txSeed: Array<{
        date: string
        sender: string
        receiver: string
        fromCurrency: Currency
        toCurrency: Currency
        amountFrom: number
        amountTo: number
        category: Category
        description: string
    }> = [
            { date: d("2025-01-12"), sender: "nikola.markovic@bank.rs", receiver: "ana.ilic@bank.rs", fromCurrency: "RSD", toCurrency: "RSD", amountFrom: 2350, amountTo: 2350, category: "FOOD", description: "Market" },
            { date: d("2024-02-18"), sender: "nikola.markovic@bank.rs", receiver: "vuk.jankovic@bank.rs", fromCurrency: "RSD", toCurrency: "RSD", amountFrom: 4200, amountTo: 4200, category: "FUEL", description: "Gas" },
            { date: d("2025-03-25"), sender: "nikola.markovic@bank.rs", receiver: "marija.stojanovic@bank.rs", fromCurrency: "RSD", toCurrency: "RSD", amountFrom: 12500, amountTo: 12500, category: "BILLS", description: "Internet" },
            { date: d("2026-04-02"), sender: "nikola.markovic@bank.rs", receiver: "luka.pavlovic@bank.rs", fromCurrency: "RSD", toCurrency: "RSD", amountFrom: 7990, amountTo: 7990, category: "SHOPPING", description: "Utensils" },
            { date: d("2026-05-08"), sender: "nikola.markovic@bank.rs", receiver: "ana.ilic@bank.rs", fromCurrency: "RSD", toCurrency: "RSD", amountFrom: 3100, amountTo: 3100, category: "ENTERTAINMENT", description: "Movies" },

            { date: d("2024-01-14"), sender: "ana.ilic@bank.rs", receiver: "nikola.markovic@bank.rs", fromCurrency: "EUR", toCurrency: "EUR", amountFrom: 35, amountTo: 35, category: "FOOD", description: "Restaurant (EUR)" },
            { date: d("2026-03-29"), sender: "ana.ilic@bank.rs", receiver: "marija.stojanovic@bank.rs", fromCurrency: "EUR", toCurrency: "EUR", amountFrom: 60, amountTo: 60, category: "SHOPPING", description: "Clothes (EUR)" },

            { date: d("2023-01-20"), sender: "vuk.jankovic@bank.rs", receiver: "luka.pavlovic@bank.rs", fromCurrency: "USD", toCurrency: "USD", amountFrom: 25, amountTo: 25, category: "ENTERTAINMENT", description: "Subscription (USD)" },
            { date: d("2026-02-05"), sender: "vuk.jankovic@bank.rs", receiver: "nikola.markovic@bank.rs", fromCurrency: "GBP", toCurrency: "GBP", amountFrom: 18, amountTo: 18, category: "RENT", description: "Share expenses (GBP)" },

            { date: d("2026-06-16"), sender: "marija.stojanovic@bank.rs", receiver: "ana.ilic@bank.rs", fromCurrency: "SEK", toCurrency: "SEK", amountFrom: 350, amountTo: 350, category: "SHOPPING", description: "Shopping (SEK)" },
            { date: d("2026-02-07"), sender: "marija.stojanovic@bank.rs", receiver: "luka.pavlovic@bank.rs", fromCurrency: "EUR", toCurrency: "EUR", amountFrom: 22, amountTo: 22, category: "HEALTH", description: "Medicine (EUR)" },

            { date: d("2026-07-22"), sender: "luka.pavlovic@bank.rs", receiver: "vuk.jankovic@bank.rs", fromCurrency: "RSD", toCurrency: "RSD", amountFrom: 5600, amountTo: 5600, category: "TRANSPORT", description: "Taxi" },
            { date: d("2026-02-06"), sender: "luka.pavlovic@bank.rs", receiver: "marija.stojanovic@bank.rs", fromCurrency: "RSD", toCurrency: "RSD", amountFrom: 9800, amountTo: 9800, category: "BILLS", description: "Bills" },
        ]

    for (const t of txSeed) {
        const senderAccId =
            t.fromCurrency === "RSD" ? acc[t.sender].checkingId : acc[t.sender].mcId
        const receiverAccId =
            t.toCurrency === "RSD" ? acc[t.receiver].checkingId : acc[t.receiver].mcId

        await db.insert(transactions).values({
            date: t.date,
            description: t.description,
            fromCurrency: t.fromCurrency,
            toCurrency: t.toCurrency,
            amountFrom: to2(t.amountFrom),
            amountTo: to2(t.amountTo),
            category: t.category,
            senderAccountId: senderAccId,
            receiverAccountId: receiverAccId,
        } as any)
    }

    console.log("Seed done.")
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})

import { describe, expect, it, vi } from "vitest"
import { db } from "@/db"
import { accounts, balances, exchangeRates, transactions, users } from "@/db/schema"
import { and, eq, or } from "drizzle-orm"

import { POST as transfer } from "@/app/api/transfer/route"

let mockUserId = ""
vi.mock("@/lib/requireUser", () => {
  return {
    requireUser: async () => ({ ok: true as const, userId: mockUserId }),
  }
})

type NewUser = { userId: string; checkingId: string; mcId: string }

async function createEnabledUser(email: string, name: string): Promise<NewUser> {
  const [u] = await db
    .insert(users)
    .values({
      name,
      email,
      salt: "test",
      password: "test",
      birthDate: "2000-01-01",
      gender: "MALE",
      phone: "060 000000",
      address: "Test",
      role: "USER",
      userStatus: "ENABLED",
    })
    .returning({ userId: users.userId })

  const [checking] = await db
    .insert(accounts)
    .values({
      number: "RS" + Math.floor(Math.random() * 1e15).toString().padStart(15, "0"),
      accountType: "CHECKING",
      status: "ACTIVE",
      openingDate: "2026-02-01",
      userId: u.userId,
    })
    .returning({ accountId: accounts.accountId })

  const [mc] = await db
    .insert(accounts)
    .values({
      number: "RS" + Math.floor(Math.random() * 1e15).toString().padStart(15, "0"),
      accountType: "MULTICURRENCY",
      status: "ACTIVE",
      openingDate: "2026-02-01",
      userId: u.userId,
    })
    .returning({ accountId: accounts.accountId })

  return { userId: u.userId, checkingId: checking.accountId, mcId: mc.accountId }
}

describe("Transfer API", () => {
  it("RSD -> RSD transfer updates balances and creates transaction", async () => {
    const senderEmail = `sender_${Date.now()}@bank.rs`
    const receiverEmail = `receiver_${Date.now()}@bank.rs`

    const sender = await createEnabledUser(senderEmail, "Sender")
    const receiver = await createEnabledUser(receiverEmail, "Receiver")

    await db.insert(balances).values([
      { accountId: sender.checkingId, currency: "RSD", amount: "1000.00" },
      { accountId: receiver.checkingId, currency: "RSD", amount: "50.00" },
    ])

    mockUserId = sender.userId

    const req = new Request("http://localhost/api/transfer", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        senderAccountId: sender.checkingId,
        receiverAccountId: receiver.checkingId,
        fromCurrency: "RSD",
        toCurrency: "RSD",
        amountFrom: "125.50",
        category: "FOOD",
        description: "Test transfer",
      }),
    })

    const res = await transfer(req)
    expect(res.status).toBe(201)

    const sBal = await db
      .select({ amount: balances.amount })
      .from(balances)
      .where(and(eq(balances.accountId, sender.checkingId), eq(balances.currency, "RSD")))
    expect(parseFloat(sBal[0].amount as string)).toBeCloseTo(874.5, 2)

    const rBal = await db
      .select({ amount: balances.amount })
      .from(balances)
      .where(and(eq(balances.accountId, receiver.checkingId), eq(balances.currency, "RSD")))
    expect(parseFloat(rBal[0].amount as string)).toBeCloseTo(175.5, 2)

    const tx = await db
      .select({ transactionId: transactions.transactionId })
      .from(transactions)
      .where(
        and(
          eq(transactions.senderAccountId, sender.checkingId),
          eq(transactions.receiverAccountId, receiver.checkingId)
        )
      )
    expect(tx.length).toBe(1)
  })

  it("EUR -> USD transfer uses exchange rates and credits receiver", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-02-23T12:00:00.000Z"))

    const today = "2026-02-23"

    await db
      .delete(exchangeRates)
      .where(
        and(
          eq(exchangeRates.rateDate, today),
          eq(exchangeRates.baseCurrency, "RSD"),
          or(eq(exchangeRates.quoteCurrency, "EUR"), eq(exchangeRates.quoteCurrency, "USD"))
        )
      )

    await db.insert(exchangeRates).values([
      { rateDate: today, baseCurrency: "RSD", quoteCurrency: "EUR", rate: "117.00" },
      { rateDate: today, baseCurrency: "RSD", quoteCurrency: "USD", rate: "108.00" },
    ])

    const uid = Math.random().toString(36).slice(2)
    const senderEmail = `sender_fx_${uid}@bank.rs`
    const receiverEmail = `receiver_fx_${uid}_r@bank.rs`

    const sender = await createEnabledUser(senderEmail, "Sender FX")
    const receiver = await createEnabledUser(receiverEmail, "Receiver FX")

    await db.insert(balances).values([
      { accountId: sender.mcId, currency: "EUR", amount: "100.00" },
      { accountId: receiver.mcId, currency: "USD", amount: "10.00" },
    ])

    mockUserId = sender.userId

    const req = new Request("http://localhost/api/transfer", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        senderAccountId: sender.mcId,
        receiverAccountId: receiver.mcId,
        fromCurrency: "EUR",
        toCurrency: "USD",
        amountFrom: "10.00",
        category: "OTHER",
      }),
    })

    const res = await transfer(req)
    expect(res.status).toBe(201)

    const sEur = await db
      .select({ amount: balances.amount })
      .from(balances)
      .where(and(eq(balances.accountId, sender.mcId), eq(balances.currency, "EUR")))
    expect(parseFloat(sEur[0].amount as string)).toBeCloseTo(90.0, 2)

    const rUsd = await db
      .select({ amount: balances.amount })
      .from(balances)
      .where(and(eq(balances.accountId, receiver.mcId), eq(balances.currency, "USD")))
    expect(parseFloat(rUsd[0].amount as string)).toBeCloseTo(20.83, 2)

    vi.useRealTimers()
  })
})
import "dotenv/config"
import bcrypt from "bcrypt"
import { db } from "./index"
import { accounts, balances, users } from "./schema"

async function main() {
    const plainPassword = "12345678"
    const salt = await bcrypt.genSalt(10)
    const hashed = await bcrypt.hash(plainPassword, salt)

    const [u] = await db.insert(users).values({
        name: "Test user",
        birthDate: "2004-01-05",
        gender: "MALE",
        phone: "061 2345678",
        address: "Jove Ilica 154",
        email: "test@example.com",
        salt,
        password: hashed,
        role: "USER"
    }).returning()

    const [admin] = await db.insert(users).values({
        name: "Admin",
        birthDate: "1990-01-01",
        gender: "MALE",
        phone: "0600000000",
        address: "Admin address",
        email: "admin@example.com",
        salt,
        password: hashed,
        role: "ADMIN",
    }).returning()

    const [checking] = await db.insert(accounts).values({
        number: "CHK-0001",
        accountType: "CHECKING",
        status: "ACTIVE",
        openingDate: "2026-02-01",
        userId: u.userId
    }).returning()

    const [multicurrency] = await db.insert(accounts).values({
        number: "MC-0001",
        accountType: "MULTICURRENCY",
        status: "ACTIVE",
        openingDate: "2026-02-01",
        userId: u.userId
    }).returning()

    await db.insert(balances).values([
        { accountId: checking.accountId, currency: "RSD", amount: "150000" },
        { accountId: multicurrency.accountId, currency: "EUR", amount: "500" },
        { accountId: multicurrency.accountId, currency: "RSD", amount: "250000" },
    ])

    console.log("Seed done.")
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
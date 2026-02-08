import {
    pgTable,
    uuid,
    varchar,
    date,
    numeric,
    pgEnum,
    uniqueIndex,
} from "drizzle-orm/pg-core"

export const accountTypeEnum = pgEnum("account_type", ["CHECKING", "MULTICURRENCY"])

export const statusEnum = pgEnum("status", ["ACTIVE", "INACTIVE"])

export const genderEnum = pgEnum("gender", ["MALE", "FEMALE"])

export const categoryEnum = pgEnum("category", ["FOOD", "FUEL", "RENT", "BILLS", "SHOPPING", "ENTERTAINMENT", "HEALTH", "TRANSPORT", "OTHER"])

export const roleEnum = pgEnum("role", ["USER", "ADMIN"])

export const userStatusEnum = pgEnum("user_status", ["UNREGISTERED", "ENABLED", "DISABLED"])

export const users = pgTable("users", {
    userId: uuid("user_id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    birthDate: date("birth_date").notNull(),
    gender: genderEnum("gender").notNull(),
    phone: varchar("phone", { length: 30 }).notNull(),
    address: varchar("address", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull().unique(),
    salt: varchar("salt", { length: 255 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    role: roleEnum("role").notNull().default("USER"),
    userStatus: userStatusEnum("user_status").notNull().default("UNREGISTERED"),
})

export const accounts = pgTable("accounts", {
    accountId: uuid("account_id").primaryKey().defaultRandom(),
    number: varchar("number", { length: 50 }).notNull().unique(),
    accountType: accountTypeEnum("account_type").notNull(),
    status: statusEnum("status").notNull(),
    openingDate: date("opening_date").notNull(),
    userId: uuid("user_id").notNull().references(() => users.userId, { onDelete: "cascade" })
})

export const balances = pgTable("balances", {
    balanceId: uuid("balance_id").primaryKey().defaultRandom(),
    currency: varchar("currency", { length: 3 }).notNull(),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    accountId: uuid("account_id").notNull().references(() => accounts.accountId, { onDelete: "cascade" })
})

export const exchangeRates = pgTable("exchange_rates", {
    exchangeRateId: uuid("exchange_rate_id").primaryKey().defaultRandom(),
    rateDate: date("rate_date").notNull(),
    baseCurrency: varchar("base_currency", { length: 3 }).notNull(),
    quoteCurrency: varchar("quote_currency", { length: 3 }).notNull(),
    rate: numeric("rate", { precision: 14, scale: 6 }).notNull(),
}, (t) => ({
    uniq: uniqueIndex("uniq_rate_day_pair").on(t.rateDate, t.baseCurrency, t.quoteCurrency)
}))

export const transactions = pgTable("transactions", {
    transactionId: uuid("transaction_id").primaryKey().defaultRandom(),
    date: date("date").notNull(),
    description: varchar("description", { length: 255 }),
    fromCurrency: varchar("from_currency", { length: 3 }).notNull(),
    toCurrency: varchar("to_currency", { length: 3 }).notNull(),
    amountFrom: numeric("amount_from", { precision: 14, scale: 2 }).notNull(),
    amountTo: numeric("amount_to", { precision: 14, scale: 2 }).notNull(),
    category: categoryEnum("category").notNull(),
    senderAccountId: uuid("sender_account_id").notNull().references(() => accounts.accountId, { onDelete: "restrict" }),
    receiverAccountId: uuid("receiver_account_id").notNull().references(() => accounts.accountId, { onDelete: "restrict" }),
    exchangeRateId: uuid("exchange_rate_id").references(() => exchangeRates.exchangeRateId, { onDelete: "set null" })
})
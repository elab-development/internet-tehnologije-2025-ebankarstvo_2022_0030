import {
    pgTable,
    uuid,
    varchar,
    date,
    numeric,
    pgEnum,
} from "drizzle-orm/pg-core"

export const accountTypeEnum = pgEnum("account_type", ["CHECKING", "MULTY_CURRENCY"])

export const statusEnum = pgEnum("status", ["ACTIVE", "INACTIVE"])

export const genderEnum = pgEnum("gender", ["MALE", "FEMALE"])

export const users = pgTable("users", {
    userId: uuid("user_id").primaryKey().defaultRandom(),
    name: varchar("name", {length: 100}).notNull(),
    birthDate: date("birth_date").notNull(),
    gender: genderEnum("gender").notNull(),
    phone: varchar("phone", {length: 30}).notNull(),
    address: varchar("address", {length: 255}),
    email: varchar("email", {length: 255}).notNull().unique(),
    salt: varchar("salt", {length: 255}).notNull(),
    password: varchar("password", {length: 255}).notNull()
})

export const accounts = pgTable("accounts", {
    accountId: uuid("account_id").primaryKey().defaultRandom(),
    number: varchar("number", {length: 50}).notNull().unique(),
    accountType: accountTypeEnum("account_type").notNull(),
    status: varchar("status", {length: 20}).notNull(),
    openingDate: date("opening_date").notNull(),
    userId: uuid("user_id").notNull()
})

export const balances = pgTable("balances", {
    balanceId: uuid("balance_id").primaryKey().defaultRandom(),
    currency: varchar("currency", {length: 3}).notNull(),
    amount: numeric("amount", {precision: 14, scale: 2}).notNull(),
    accountId: uuid("account_id").notNull()
})

export const transactions = pgTable("transactions", {
    transactionId: uuid("transaction_id").primaryKey().defaultRandom(),
    date: date("date").defaultNow(),
    description: varchar("description", {length: 255}),
    amount: numeric("amount", {precision: 14, scale: 2}).notNull(),
    senderId: uuid("sender_id").notNull(),
    receiverId: uuid("receiver_id").notNull()
})
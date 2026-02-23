export type Currency = "RSD" | "EUR" | "USD"

export type Account = {
    id: string
    name: string
    currency: Currency
    balance: number
}

export type TransactionCategory = "Food" | "Bills" | "Transport" | "Other"

export type Transaction = {
    id: string
    accountId: string
    title: string
    category: TransactionCategory
    amount: number
    createdAt: string
}
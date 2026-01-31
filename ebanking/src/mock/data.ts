import { Account, Transaction } from "@/shared/types";

export const mockAccounts: Account[] = [
    { id: "a1", name: "Checking", currency: "RSD", balance: 125340 },
    { id: "a2", name: "Multy-currency", currency: "EUR", balance: 820.5 },
]

export const mockTransactions: Transaction[] = [
    { id: "t1", accountId: "a1", title: "Maxi", category: "Food", amount: -2340, createdAt: "2026-01-10" },
    { id: "t2", accountId: "a1", title: "Utility", category: "Bills", amount: -8600, createdAt: "2026-01-05" },
    { id: "t3", accountId: "a2", title: "Payment", category: "Other", amount: 200, createdAt: "2026-01-02" },
]
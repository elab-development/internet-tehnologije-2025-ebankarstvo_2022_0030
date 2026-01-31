"use client"

import Input from "@/components/Input";
import { mockTransactions } from "@/mock/data";
import { Transaction, TransactionCategory } from "@/shared/types";
import { useEffect, useState } from "react";

const categories: (TransactionCategory | "All")[] = ["All", "Food", "Bills", "Transport", "Other"]

export default function TransactionPage() {
    const [query, setQuery] = useState("")
    const [category, setCategory] = useState<(typeof categories)[number]>("All")
    const [items, setItems] = useState<Transaction[]>(mockTransactions)

    useEffect(() => {
        let data = mockTransactions
        if (category !== "All") {
            data = data.filter((t) => t.category === category)
        }
        if (query.trim()) {
            const q = query.toLowerCase()
            data = data.filter((t) => t.title.toLowerCase().includes(q))
        }
        setItems(data)
    }, [query, category])

    return (
        <main className="mx-auto max-w-5xl px-4 py-8">
            <h1 className="text-2xl font-bold">Transactions</h1>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Input label="Search by title" value={query} onChange={setQuery} placeholder="e.g. Food"/>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}>
                            {categories.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        className="rounded border border-gray-300 px-3 py-2"
                    </select>
                </div>
                
                <div className="mt-6 flex flex-col gap-2">
                    {items.length === 0 ? (
                        <p className="text-gray-500">No transactions avaliable.</p>
                    ) : (
                        items.map((t) => (
                            <div key={t.id} className="flex items-center justify-between rounded border border-gray-200 p-3">
                                <div>
                                    <p className="font-medium">{t.title}</p>
                                    <p className="text-sm text-gray-500">{t.category} • {t.createdAt}</p>
                                </div>
                                <p className={t.amount < 0 ? "text-red-600" : "text-green-600"}>{t.amount}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </main>
    )
}
"use client"

import Button from "@/components/Button"
import Input from "@/components/Input"
import { mockAccounts } from "@/mock/data"
import { useState } from "react"

export default function TransferPage() {
    const [fromId, setFromId] = useState(mockAccounts[0].id)
    const [toId, setToId] = useState(mockAccounts[1].id)
    const [amount, setAmount] = useState("")
    const [err, setErr] = useState("")
    const [okMsg, setOkMsg] = useState("")

    const submit = () => {
        setErr("")
        setOkMsg("")

        const value = Number(amount)

        if (!amount.trim())
            return setErr("Enter an amount.")
        if (Number.isNaN(value) || value <= 0)
            return setErr("Amount must be positive.")
        if (fromId === toId)
            return setErr("Accounts must be different.")

        setOkMsg("Transfer successful.")
    }

    return (
        <main className="mx-auto max-w-5xl px-4 py-8">
            <h1 className="text-2xl font-bold">Fund transfer</h1>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">From account:</label>
                    <select
                        value={fromId}
                        onChange={(e) => setFromId(e.target.value)}
                        className="rounded border border-gray-300 px-3 py-2"
                    >
                        {mockAccounts.map((a) => (
                            <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">To account:</label>
                    <select
                        value={toId}
                        onChange={(e) => setToId(e.target.value)}
                        className="rounded border border-gray-300 px-3 py-2"
                    >
                        {mockAccounts.map((a) => (
                            <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>
                        ))}
                    </select>
                </div>

                <Input label="Amount" value={amount} onChange={setAmount} placeholder="e.g. 2500" />

                <div className="flex items-end">
                    <Button onClick={submit}>Execute transfer</Button>
                </div>

                {err ? <p className="mt-4 text-red-600">{err}</p> : null}
                {okMsg ? <p className="mt-4 text-green-600">{okMsg}</p> : null}
            </div>
        </main>
    )
}
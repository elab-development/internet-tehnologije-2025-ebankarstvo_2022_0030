import { mockAccounts, mockTransactions } from "@/mock/data";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <section className="mt-6">
        <h2 className="text-lg font-semibold">My accounts</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {mockAccounts.map((a) => (
            <div key={a.id} className="rounded border border-gray-200 p-4">
              <p className="font-semibold">{a.name}</p>
              <p className="text-sm text-gray-500">{a.currency}</p>
              <p className="mt-2 text-xl">{a.balance}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Latest transactions</h2>
        <div className="mt-3 flex flex-col gap-2">
          {mockTransactions.slice(3).map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded border border-gray-200 p-3">
              <div>
                <p className="font-medium">{t.title}</p>
                <p className="text-sm text-gray-500">{t.category} • {t.createdAt}</p>
              </div>
              <p className={t.amount < 0 ? "text-red-600" : "text-green-600"}>{t.amount}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
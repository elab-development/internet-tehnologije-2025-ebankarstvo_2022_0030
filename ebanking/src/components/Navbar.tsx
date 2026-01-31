import Link from "next/link";

export default function Navbar() {
    return (
        <header className="w-full border-b border-gray-200 bg-white">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                <Link href="/" className="font-semibold text-indigo-600">E-Bank</Link>
            </div>
            <nav className="flex items-center gap-4 text-sm">
                <Link href="/transactions" className="hover:text-indigo-600">Transactions</Link>
                <Link href="/transfers" className="hover:text-indigo-600">Transfers</Link>
            </nav>
        </header>
    )
}
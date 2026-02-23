"use client"

import Button from "@/components/Button"
import Input from "@/components/Input"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function RegisterPage() {
    const router = useRouter()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [address, setAddress] = useState("")
    const [birthDate, setBirthDate] = useState("")
    const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [err, setErr] = useState("")
    const [success, setSuccess] = useState("")
    const [loading, setLoading] = useState(false)

    const submit = async () => {
        setErr("")
        setSuccess("")

        if (password !== confirmPassword) {
            setErr("Passwords not matching.")
            return
        }

        setLoading(true)

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    address,
                    birthDate,
                    gender,
                    password,
                }),
            })

            const data = await res.json().catch(() => ({}))

            if (!res.ok) {
                setErr(data?.error ?? "Registration failed.")
                return
            }

            setSuccess("Registration successful. Waiting for admin's approval.")
            setTimeout(() => router.push("/login"), 1200)
        } catch {
            setErr("Network error.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-slate-950">
            <div className="mx-auto flex max-w-6xl items-center px-6 py-5">
                <div className="flex items-center gap-3 text-white">
                    <Image src="/icon.png" alt="Icon" width={44} height={44} priority />
                    <div className="leading-tight">
                        <div className="text-sm font-semibold tracking-wide">E-BANK</div>
                        <div className="text-xs text-white/70">Internet banking</div>
                    </div>
                </div>
            </div>

            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 pb-10 pt-2 lg:grid-cols-2 lg:items-stretch">
                <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                    <div className="relative h-[320px] w-full lg:h-full lg:min-h-[560px]">
                        <Image src="/background.png" alt="Hero" fill className="object-cover" priority />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/10" />
                    </div>
                </section>

                <section className="flex items-center lg:justify-end">
                    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white p-7 shadow-xl">
                        <div className="mb-6">
                            <h2 className="mt-6 text-xl font-semibold text-slate-900">Register</h2>
                            <p className="mt-1 text-sm text-slate-500">Fill in all the necessary data.</p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <Input label="First and last name" value={name} onChange={setName} />
                            <Input label="E-mail" value={email} onChange={setEmail} />
                            <Input label="Phone number" value={phone} onChange={setPhone} />
                            <Input label="Adress" value={address} onChange={setAddress} />
                            <Input label="Date of birth" value={birthDate} onChange={setBirthDate} type="date" />

                            <div className="flex gap-4 text-sm">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        checked={gender === "MALE"}
                                        onChange={() => setGender("MALE")}
                                    />
                                    Male
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        checked={gender === "FEMALE"}
                                        onChange={() => setGender("FEMALE")}
                                    />
                                    Female
                                </label>
                            </div>

                            <Input
                                label="Password"
                                value={password}
                                onChange={setPassword}
                                type="password"
                            />
                            <Input
                                label="Confirm password"
                                value={confirmPassword}
                                onChange={setConfirmPassword}
                                type="password"
                            />

                            {err ? <p className="text-sm text-red-600">{err}</p> : null}
                            {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

                            <Button onClick={submit} disabled={loading}>
                                {loading ? "Registering..." : "Register"}
                            </Button>
                        </div>
                        <p className="mt-2 text-sm text-slate-500">Already have an account?{" "}
                            <Link href="/login" className="font-medium text-indigo-600 hover:underline">Log in.</Link>
                        </p>
                    </div>
                </section>
            </div>
        </main>
    )
}

import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { COOKIE_NAME, signToken } from "@/lib/auth"

export async function POST(req: Request) {
    const body = await req.json().catch(() => null)
    if (!body)
        return NextResponse.json({ error: "Invalid JSON." }, { status: 400 })

    const { email, password } = body as { email?: string, password?: string }
    if (!email || !password)
        return NextResponse.json({ error: "Missing fields." }, { status: 400 })

    const found = await db
        .select({ userId: users.userId, email: users.email, passwordHash: users.password })
        .from(users)
        .where(eq(users.email, email))

    if (found.length === 0)
        return NextResponse.json({ error: "Incorrect e-mail and/or password." }, { status: 401 })

    const ok = await bcrypt.compare(password, found[0].passwordHash)
    if (!ok)
        return NextResponse.json({ error: "Incorrect e-mail and/or password." }, { status: 401 })


    const token = signToken({ userId: found[0].userId, email: found[0].email })
    const res = NextResponse.json({ ok: true })

    res.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/"
    })

    return res
}
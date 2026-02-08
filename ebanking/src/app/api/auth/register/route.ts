import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { db } from "@/db"
import { users } from "@/db/schema"

export async function POST(req: Request) {
    const body = await req.json().catch(() => null)
    if (!body)
        return NextResponse.json({ error: "Ivalid JSON" }, { status: 400 })

    const { name, email, password, birthDate, gender, phone, address } = body as {
        name?: string;
        email?: string;
        password?: string;
        birthDate?: string;
        gender?: "MALE" | "FEMALE";
        phone?: string;
        address?: string;
    }
    if (!name || !email || !password || !birthDate || !gender || !phone)
        return NextResponse.json({ error: "Missing fields." }, { status: 400 })

    const salt = await bcrypt.genSalt(10)
    const hashed = await bcrypt.hash(password, salt)

    try {
        const [created] = await db.insert(users).values({
            name,
            email,
            salt,
            password: hashed,
            birthDate,
            gender,
            phone,
            address,
            userStatus: "UNREGISTERED",
            role: "USER",
        }).returning({ userId: users.userId, email: users.email })

        return NextResponse.json({ user: created }, { status: 201 })
    } catch {
        return NextResponse.json({ error: "Email already exists." }, { status: 409 })
    }
}
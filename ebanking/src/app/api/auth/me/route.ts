import { db } from "@/db";
import { users } from "@/db/schema";
import { COOKIE_NAME, verifyToken } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const token = (await cookies()).get(COOKIE_NAME)?.value

    if (!token)
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

    let payload: { userId: string; email: string }
    try {
        payload = verifyToken(token)
    } catch {
        return NextResponse.json({ error: "Invalid token." }, { status: 401 })
    }

    const found = await db
        .select({
            userId: users.userId,
            name: users.name,
            email: users.email,
            phone: users.phone,
            address: users.address,
            birthDate: users.birthDate,
            gender: users.gender,
            role: users.role,
            userStatus: users.userStatus,
        })
        .from(users)
        .where(eq(users.userId, payload.userId))

    if (found.length === 0) {
        return NextResponse.json({ error: "User not found." }, { status: 401 })
    }

    return NextResponse.json({ user: found[0] }, { status: 200 })
}
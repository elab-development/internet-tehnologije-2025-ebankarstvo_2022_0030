import { COOKIE_NAME, verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const token = (await cookies()).get(COOKIE_NAME)?.value

    if (!token)
        return NextResponse.json({ user: null }, { status: 200 })

    try {
        const payload = verifyToken(token)
        return NextResponse.json({ user: { userId: payload.userId, email: payload.email } })
    } catch {
        return NextResponse.json({ user: null }, { status: 200 })
    }
}
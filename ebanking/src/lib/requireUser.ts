import { db } from "@/db"
import { users } from "@/db/schema"
import { COOKIE_NAME, verifyToken } from "@/lib/auth"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"

export async function requireUser() {
    const token = (await cookies()).get(COOKIE_NAME)?.value
    if (!token) return { ok: false as const, status: 401 as const, error: "Unauthorized" }

    let payload: { userId: string }
    try {
        payload = verifyToken(token)
    } catch {
        return { ok: false as const, status: 401 as const, error: "Invalid token" }
    }

    const rows = await db
        .select({ role: users.role, userStatus: users.userStatus })
        .from(users)
        .where(eq(users.userId, payload.userId))

    if (rows.length === 0) return { ok: false as const, status: 401 as const, error: "User not found" }

    if (rows[0].userStatus !== "ENABLED") {
        return { ok: false as const, status: 403 as const, error: "Account is disabled" }
    }

    if (rows[0].role !== "USER") {
        return { ok: false as const, status: 403 as const, error: "Admins cannot perform transactions" }
    }

    return { ok: true as const }
}

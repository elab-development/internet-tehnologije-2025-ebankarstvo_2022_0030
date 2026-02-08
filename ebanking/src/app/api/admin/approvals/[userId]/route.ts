import { NextResponse } from "next/server"
import { db } from "@/db"
import { users } from "@/db/schema"
import { requireAdmin } from "@/lib/requireAdmin"
import { eq } from "drizzle-orm"

export async function PATCH(
  req: Request,
  ctx: { params: { userId: string } | Promise<{ userId: string }> }
) {
  const guard = await requireAdmin()
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status })
  }

  const params = await Promise.resolve(ctx.params as any)
  const userId = params?.userId as string | undefined

  if (!userId || userId === "undefined") {
    return NextResponse.json({ error: "Missing userId param" }, { status: 400 })
  }

  const existing = await db
    .select({ userStatus: users.userStatus })
    .from(users)
    .where(eq(users.userId, userId))

  if (existing.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  if (existing[0].userStatus !== "UNREGISTERED") {
    return NextResponse.json(
      { error: "Only UNREGISTERED users can be approved." },
      { status: 400 }
    )
  }

  const updated = await db
    .update(users)
    .set({ userStatus: "ENABLED" })
    .where(eq(users.userId, userId))
    .returning({
      userId: users.userId,
      email: users.email,
      userStatus: users.userStatus,
    })

  return NextResponse.json({ user: updated[0] }, { status: 200 })
}

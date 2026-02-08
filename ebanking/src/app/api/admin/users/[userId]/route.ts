import { NextResponse } from "next/server"
import { db } from "@/db"
import { users } from "@/db/schema"
import { requireAdmin } from "@/lib/requireAdmin"
import { eq } from "drizzle-orm"

type PatchBody = {
  userStatus: "ENABLED" | "DISABLED"
}

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
    return NextResponse.json({ error: "Missing userId param." }, { status: 400 })
  }

  const body = (await req.json().catch(() => null)) as PatchBody | null
  if (!body) return NextResponse.json({ error: "Invalid JSON." }, { status: 400 })
  if (!body.userStatus) return NextResponse.json({ error: "userStatus is required." }, { status: 400 })
  if (body.userStatus !== "ENABLED" && body.userStatus !== "DISABLED") {
    return NextResponse.json({ error: "Invalid userStatus." }, { status: 400 })
  }

  if (guard.userId === userId && body?.userStatus === "DISABLED") {
    return NextResponse.json(
      { error: "Admin cannot disable himself." },
      { status: 400 }
    )
  }

  const existing = await db
    .select({ userStatus: users.userStatus })
    .from(users)
    .where(eq(users.userId, userId))

  if (existing.length === 0) {
    return NextResponse.json({ error: "User not found." }, { status: 404 })
  }

  const currentStatus = existing[0].userStatus

  if (currentStatus === "UNREGISTERED") {
    return NextResponse.json(
      { error: "UNREGISTERED user approved only through User Approvals." },
      { status: 400 }
    )
  }

  if ((body as any).userStatus === "UNREGISTERED") {
    return NextResponse.json(
      { error: "Invalid userStatus for this endpoint." },
      { status: 400 }
    )
  }

  const updated = await db
    .update(users)
    .set({ userStatus: body.userStatus })
    .where(eq(users.userId, userId))
    .returning({
      userId: users.userId,
      email: users.email,
      userStatus: users.userStatus,
    })

  if (updated.length === 0) {
    return NextResponse.json({ error: "User not found." }, { status: 404 })
  }

  return NextResponse.json({ user: updated[0] }, { status: 200 })
}
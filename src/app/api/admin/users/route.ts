import { NextResponse } from "next/server"
import { db } from "@/db"
import { users } from "@/db/schema"
import { requireAdmin } from "@/lib/requireAdmin"

export async function GET() {
  const guard = await requireAdmin()

  if (!guard.ok) 
    return NextResponse.json({ error: guard.error }, { status: guard.status })

  const rows = await db
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

  return NextResponse.json({ users: rows }, { status: 200 })
}

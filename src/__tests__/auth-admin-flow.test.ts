import { describe, expect, it, vi } from "vitest"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

import { POST as register } from "@/app/api/auth/register/route"
import { POST as login } from "@/app/api/auth/login/route"
import { PATCH as approve } from "@/app/api/admin/approvals/[userId]/route"

vi.mock("@/lib/requireAdmin", () => {
  return {
    requireAdmin: async () => ({ ok: true as const, userId: "test-admin" }),
  }
})

describe("Auth + Admin approval flow", () => {
  it("register -> blocked login -> approve -> successful login", async () => {
    const email = `ci_${Date.now()}@bank.rs`
    const password = "StrongPass123!"

    const regReq = new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "CI User",
        email,
        password,
        birthDate: "2000-01-01",
        gender: "MALE",
        phone: "060 999999",
        address: "Test Address",
      }),
    })

    const regRes = await register(regReq)
    expect(regRes.status).toBe(201)

    const regJson = (await regRes.json()) as { user: { userId: string; email: string } }
    expect(regJson.user.email).toBe(email)

    const created = await db
      .select({ userStatus: users.userStatus, role: users.role })
      .from(users)
      .where(eq(users.email, email))

    expect(created[0].role).toBe("USER")
    expect(created[0].userStatus).toBe("UNREGISTERED")

    const loginReq1 = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const loginRes1 = await login(loginReq1)
    expect(loginRes1.status).toBe(403)

    const userRow = await db.select({ userId: users.userId }).from(users).where(eq(users.email, email))
    const userId = userRow[0].userId

    const approveReq = new Request("http://localhost/api/admin/approvals/" + userId, { method: "PATCH" })
    const approveRes = await approve(approveReq, { params: { userId } })
    expect(approveRes.status).toBe(200)

    const loginReq2 = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const loginRes2 = await login(loginReq2)
    expect(loginRes2.status).toBe(200)

    const setCookie = loginRes2.headers.get("set-cookie")
    expect(setCookie).toBeTruthy()
    expect(setCookie!).toContain("ebanka_token=")
  })
})
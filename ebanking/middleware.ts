import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const COOKIE_NAME = "ebanka_token"

const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/auth/register"]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.includes(".")) {
    return NextResponse.next()
  }

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next()
  }

  if (pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  const token = req.cookies.get(COOKIE_NAME)?.value

  if (!token && pathname !== "/login") {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  if (token && pathname === "/login") {
    const url = req.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
}

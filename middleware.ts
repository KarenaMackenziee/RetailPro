import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if the user is authenticated
  if (!session) {
    // If the user is not authenticated and trying to access a protected route, redirect to login
    if (
      req.nextUrl.pathname.startsWith("/dashboard") ||
      req.nextUrl.pathname.startsWith("/cart") ||
      req.nextUrl.pathname.startsWith("/orders")
    ) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/login"
      return NextResponse.redirect(redirectUrl)
    }
  }

  // If the user is authenticated and trying to access login page, redirect to dashboard
  if (session && req.nextUrl.pathname === "/login") {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/dashboard"
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*", "/cart", "/orders"],
}

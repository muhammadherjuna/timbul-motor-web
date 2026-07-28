import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Protect all routes under /admin
  const isProtectedRoute = path.startsWith("/admin");
  const isPublicRoute = path === "/login";

  // Check for session cookie
  const sessionCookie = request.cookies.get("session")?.value;

  if (isProtectedRoute) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.nextUrl));
    }

    const payload = await verifySession(sessionCookie);
    
    if (!payload || payload.role !== "admin") {
      return NextResponse.redirect(new URL("/login", request.nextUrl));
    }
  }

  // If already logged in, redirect away from login page
  if (isPublicRoute && sessionCookie) {
    const payload = await verifySession(sessionCookie);
    if (payload && payload.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};

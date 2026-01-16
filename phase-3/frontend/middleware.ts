import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Specific handling for /api/chat
  if (pathname.startsWith("/api/chat")) {
    // 1. Try to get token from cookies (Better Auth default names)
    // The session token is usually the JWT when using the jwt plugin
    const token = request.cookies.get("better-auth.session_token")?.value || 
                  request.cookies.get("better-auth.access_token")?.value;

    // 2. If token exists and Authorization header is missing, inject it
    if (token && !request.headers.get("Authorization")) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("Authorization", `Bearer ${token}`);
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // 3. If no token, allow the request to proceed (excluding it from strict auth blocking here)
    // The backend will enforce authentication if required and return 401/403.
    return NextResponse.next();
  }

  // For all other routes, continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match API routes to ensure tokens are passed
    "/api/chat",
    // You can add other protected routes here
    // "/dashboard/:path*"
  ],
};

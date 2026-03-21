import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // 1. Get auth token from cookies
    const sessionToken = request.cookies.get("firebase-token")?.value;

    // 2. Protect Admin Routes
    if (pathname.startsWith("/admin")) {
        if (!sessionToken) {
            return NextResponse.redirect(new URL("/auth/login?callback=" + pathname, request.url));
        }
    }

    // 3. Protect Dashboard Routes
    if (pathname.startsWith("/dashboard")) {
        if (!sessionToken) {
            return NextResponse.redirect(new URL("/auth/login?callback=" + pathname, request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/dashboard/:path*",
    ],
};

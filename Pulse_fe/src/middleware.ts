import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedPaths = ["/dashboard", "/projects", "/teams", "/settings"];

// Routes only for unauthenticated users
const authPaths = ["/signin", "/signup", "/reset-password"];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check for auth cookie set by useAuthStore
    const authCookie = request.cookies.get("pulse-auth-status");
    const isAuthenticated = authCookie?.value === "1";

    // Protected routes: redirect to signin if not authenticated
    const isProtected = protectedPaths.some(
        (path) => pathname === path || pathname.startsWith(path + "/")
    );

    if (isProtected && !isAuthenticated) {
        const signinUrl = new URL("/signin", request.url);
        signinUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(signinUrl);
    }

    // Auth routes: redirect to dashboard if already authenticated
    const isAuthPath = authPaths.some(
        (path) => pathname === path || pathname.startsWith(path + "/")
    );

    if (isAuthPath && isAuthenticated) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/projects/:path*",
        "/teams/:path*",
        "/settings/:path*",
        "/signin",
        "/signup",
        "/reset-password",
    ],
};

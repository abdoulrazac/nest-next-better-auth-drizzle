import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_PATHS = ["/auth/sign-in", "/auth/sign-up", "/auth/forgot-password"];
const SESSION_COOKIE = "better-auth.session_token";

/**
 * Minimum structural shape of a better-auth session token cookie.
 * In edge runtimes we cannot call `auth.api.getSession()` (DB access), so this
 * middleware only drives UX redirects. Authoritative auth is enforced by the
 * NestJS backend on every request. The structure check below filters trivially
 * fake cookies (e.g. "1" or empty string) so attackers cannot disable the
 * redirect simply by setting any cookie value.
 *
 * A valid better-auth session token looks like `<sessionId>.<signature>` with
 * the signature being a 64-char hex (<=). We require the value to be at least
 * 32 chars and to contain a dot separator — rejecting obvious junk without
 * attempting to verify the signature itself.
 */
function looksLikeSessionToken(value: string | undefined): boolean {
  if (!value || value.length < 32) return false;
  const dot = value.indexOf(".");
  if (dot === -1) return false;
  // <sessionId> must not be empty and <signature> must not be empty
  return dot > 0 && dot < value.length - 1;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE);
  const isAuthenticated = looksLikeSessionToken(sessionCookie?.value);

  // Redirect unauthenticated users away from protected routes
  const isDashboard =
    pathname === "/" ||
    (!AUTH_PATHS.some((p) => pathname.startsWith(p)) &&
      !pathname.startsWith("/auth"));

  if (isDashboard && !isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  // Redirect authenticated users away from auth pages
  if (AUTH_PATHS.some((p) => pathname.startsWith(p)) && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude API routes — those are proxied to the backend via rewrites and
    // must never be intercepted by the auth redirect logic here.
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

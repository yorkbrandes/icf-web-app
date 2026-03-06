import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { verifyToken } from "./lib/auth";

const intlMiddleware = createMiddleware(routing);

const COOKIE_NAME_BOSS = "icf_boss_token";
const COOKIE_NAME_ADMIN = "icf_admin_token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Extract locale from path
  const localeMatch = pathname.match(/^\/(de|en|fr)(\/|$)/);
  const locale = localeMatch ? localeMatch[1] : "de";

  // Boss route protection
  if (pathname.match(/^\/(de|en|fr)\/boss(?!\/login)/)) {
    const token = request.cookies.get(COOKIE_NAME_BOSS)?.value;
    if (!token) {
      return NextResponse.redirect(new URL(`/${locale}/boss/login`, request.url));
    }
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "boss") {
      return NextResponse.redirect(new URL(`/${locale}/boss/login`, request.url));
    }
  }

  // Admin route protection
  if (pathname.match(/^\/(de|en|fr)\/admin(?!\/login)/)) {
    const token = request.cookies.get(COOKIE_NAME_ADMIN)?.value;
    if (!token) {
      return NextResponse.redirect(new URL(`/${locale}/admin/login`, request.url));
    }
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.redirect(new URL(`/${locale}/admin/login`, request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all pathnames except static files, api routes, and _next
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};

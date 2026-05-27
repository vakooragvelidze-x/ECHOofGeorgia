import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isPublicPage =
    pathname === "/access" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  const isAccessApi = pathname.startsWith("/api/access");

  const isStaticAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".");

  if (isPublicPage || isAccessApi || isStaticAsset) {
    return NextResponse.next();
  }

  const hasAccess = request.cookies.get("echo_access")?.value === "granted";

  if (hasAccess) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Access required." },
      { status: 401 }
    );
  }

  const accessUrl = new URL("/access", request.url);
  return NextResponse.redirect(accessUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
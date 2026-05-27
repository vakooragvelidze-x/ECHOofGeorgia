import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isAccessPage = pathname === "/access";
  const isAccessApi = pathname.startsWith("/api/access");
  const isAuthApi = pathname.startsWith("/api/auth");
  const isStaticAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".");

  if (isAccessApi || isAuthApi || isStaticAsset) {
    return NextResponse.next();
  }

  const hasAccess = request.cookies.get("echo_access")?.value === "granted";

  if (hasAccess) {
    if (isAccessPage) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  if (isAccessPage) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Access required." }, { status: 401 });
  }

  return NextResponse.redirect(new URL("/access", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
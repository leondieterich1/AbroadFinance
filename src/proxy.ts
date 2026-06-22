import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const proxy = auth((req: NextRequest & { auth?: unknown }) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/dashboard") && !(req as { auth?: unknown }).auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if ((pathname === "/login" || pathname === "/signup") && (req as { auth?: unknown }).auth) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
};

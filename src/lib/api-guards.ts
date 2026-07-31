import { NextResponse } from "next/server";
import { auth } from "@/auth";

/** Rejects the request unless it carries a valid session. Use for any route that touches account data. */
export async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    return { session: null, error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }
  return { session, error: null as null };
}

/**
 * Rejects cross-origin state-changing requests (basic CSRF defense-in-depth on
 * top of NextAuth's own cookie SameSite policy). Browsers always send an
 * Origin header on cross-site fetch/XHR/form POSTs; same-site requests are
 * allowed through even without one (e.g. same-tab navigation, curl/tests).
 */
export function requireSameOrigin(request: Request): NextResponse | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;

  const host = request.headers.get("host");
  try {
    if (new URL(origin).host !== host) {
      return NextResponse.json({ error: "cross_origin_forbidden" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "invalid_origin" }, { status: 403 });
  }
  return null;
}

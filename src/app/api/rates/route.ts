import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const from = req.nextUrl.searchParams.get("from") ?? "EUR";

  const res = await fetch(`https://api.frankfurter.dev/v1/latest?from=${from}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch rates" }, { status: 502 });
  }

  const data = await res.json();
  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}

import { NextResponse } from "next/server";
import { listInstitutions, isConfigured } from "@/lib/gocardless";

export async function GET(request: Request) {
  if (!isConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country") ?? "DE";

  try {
    const institutions = await listInstitutions(country);
    // Return all institutions sorted by name
    const sorted = institutions.sort((a, b) => a.name.localeCompare(b.name));
    return NextResponse.json(sorted, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch (err) {
    console.error("GoCardless institutions error:", err);
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}

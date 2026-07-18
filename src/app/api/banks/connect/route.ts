import { NextResponse } from "next/server";
import { createRequisition, isConfigured } from "@/lib/gocardless";

export async function POST(request: Request) {
  if (!isConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  let body: { institutionId?: string; redirectUrl?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { institutionId, redirectUrl } = body;
  if (!institutionId || !redirectUrl) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  try {
    const requisition = await createRequisition(institutionId, redirectUrl);
    return NextResponse.json({
      requisitionId: requisition.id,
      link: requisition.link,
    });
  } catch (err) {
    console.error("GoCardless connect error:", err);
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}

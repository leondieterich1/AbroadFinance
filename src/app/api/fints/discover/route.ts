import { NextResponse } from "next/server";
import { FinTSClient, FinTSConfig } from "lib-fints";
import { lookupBlz, candidateUrls } from "@/lib/blz-database";

const PRODUCT_ID = "00000000000000000000";
const PRODUCT_VERSION = "1.0";

// Try to ping a FinTS URL — if the bank responds (even with an error), the URL is valid
async function probeUrl(url: string, blz: string): Promise<boolean> {
  try {
    const config = FinTSConfig.forFirstTimeUse(
      PRODUCT_ID, PRODUCT_VERSION, url, blz,
      "__probe__", "__probe__"
    );
    const client = new FinTSClient(config);
    await client.synchronize();
    return true; // Bank responded = URL is valid
  } catch (err) {
    const msg = String(err);
    // If error is about wrong credentials / auth, the URL itself works
    if (msg.includes("9010") || msg.includes("9020") || msg.includes("9030") ||
        msg.includes("9210") || msg.includes("9340") || msg.includes("auth") ||
        msg.includes("Passwort") || msg.includes("PIN") || msg.includes("unbekannt") ||
        msg.includes("Benutzer") || msg.includes("gesperrt")) {
      return true;
    }
    return false;
  }
}

export async function POST(request: Request) {
  let body: { blz?: string; iban?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const blz = body.blz ?? body.iban?.replace(/\s/g, "").slice(4, 12);
  if (!blz || blz.length !== 8) {
    return NextResponse.json({ error: "invalid_blz" }, { status: 400 });
  }

  // Exact database match — no probing needed
  const known = lookupBlz(blz);
  if (known?.url) {
    return NextResponse.json({ url: known.url, name: known.name, logo: known.logo, color: known.color, found: true });
  }

  // Try candidate URLs (Sparkasse / Volksbank heuristics)
  const candidates = candidateUrls(blz);
  for (const url of candidates) {
    const works = await probeUrl(url, blz);
    if (works) {
      const isSparkasse = url.includes("s-fints-pt");
      const isVolksbank = url.includes("vr-networld");
      return NextResponse.json({
        url,
        name: isSparkasse ? "Sparkasse" : isVolksbank ? "Volksbank / VR-Bank" : "Meine Bank",
        logo: isSparkasse ? "https://logo.clearbit.com/sparkasse.de" : isVolksbank ? "https://logo.clearbit.com/volksbank.de" : "",
        color: isSparkasse ? "#E30613" : isVolksbank ? "#004B9B" : "#0d1f3c",
        found: true,
      });
    }
  }

  return NextResponse.json({ found: false, blz });
}

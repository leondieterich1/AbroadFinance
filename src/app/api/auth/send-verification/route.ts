import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createVerificationToken } from "@/lib/verification";

export async function POST(req: NextRequest) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "E-Mail-Versand nicht konfiguriert." }, { status: 503 });
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { email, name } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "E-Mail fehlt" }, { status: 400 });
  }

  const token = await createVerificationToken(email, name ?? email.split("@")[0]);
  const baseUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const verifyUrl = `${baseUrl}/verify?token=${encodeURIComponent(token)}`;

  const { error } = await resend.emails.send({
    from: "FinanceAbroad <onboarding@resend.dev>",
    to: email,
    subject: "Bestätige deine E-Mail – FinanceAbroad",
    html: `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

        <!-- Header -->
        <tr><td style="background:#0d1f3c;padding:36px 40px;text-align:center;">
          <p style="margin:0;color:rgba(255,255,255,0.5);font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin-bottom:8px;">✈️ FINANCEABROAD</p>
          <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;">Fast geschafft!</h1>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:40px;">
          <p style="margin:0 0 8px;font-size:16px;color:#0d1f3c;font-weight:700;">Hi ${name ?? "dort"} 👋</p>
          <p style="margin:0 0 28px;font-size:15px;color:rgba(13,31,60,0.55);line-height:1.6;">
            Willkommen bei FinanceAbroad! Klicke auf den Button unten, um deine E-Mail-Adresse zu bestätigen und dein Konto zu aktivieren.
          </p>

          <!-- CTA Button -->
          <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:28px;">
            <tr><td align="center">
              <a href="${verifyUrl}" style="display:inline-block;background:#0d1f3c;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:12px;letter-spacing:0.2px;">
                E-Mail bestätigen →
              </a>
            </td></tr>
          </table>

          <p style="margin:0 0 6px;font-size:13px;color:rgba(13,31,60,0.35);">Oder kopiere diesen Link in deinen Browser:</p>
          <p style="margin:0 0 28px;font-size:12px;color:rgba(13,31,60,0.35);word-break:break-all;background:#f8f8f9;padding:12px;border-radius:8px;">${verifyUrl}</p>

          <hr style="border:none;border-top:1px solid #f0f0f2;margin:0 0 24px;">
          <p style="margin:0;font-size:13px;color:rgba(13,31,60,0.35);line-height:1.6;">
            Dieser Link ist <strong>24 Stunden</strong> gültig. Falls du kein Konto erstellt hast, kannst du diese E-Mail ignorieren.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8f8f9;padding:20px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;color:rgba(13,31,60,0.3);">FinanceAbroad · Für Studenten weltweit 🌍</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });

  if (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ error: "E-Mail konnte nicht gesendet werden" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

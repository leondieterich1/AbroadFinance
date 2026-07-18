import { NextResponse } from "next/server";
import { FinTSClient, FinTSConfig } from "lib-fints";
import type { Statement, Transaction } from "lib-fints";

// Product ID — register at https://www.fints.org/de/hersteller/produktregistrierung
// Using a dev placeholder; replace with a registered ID for production use
const PRODUCT_ID = "00000000000000000000";
const PRODUCT_VERSION = "1.0";

// In-memory session store per serverless instance
// The TAN flow keeps the same FinTSClient alive between /connect and /tan
type Session = {
  client: FinTSClient;
  pendingAction: "sync" | "statements";
  accountsPending: string[]; // account numbers still to fetch
  accountsDone: AccountResult[];
  tanReference?: string;
};

export const sessions = new Map<string, Session>();

export type AccountResult = {
  iban: string;
  accountNumber: string;
  holderName: string;
  balance: number;
  currency: string;
  transactions: { date: string; description: string; amount: number; currency: string }[];
};

function txToResult(
  tx: Transaction,
  currency: string
): { date: string; description: string; amount: number; currency: string } {
  const date = tx.valueDate instanceof Date
    ? tx.valueDate.toISOString().slice(0, 10)
    : (tx.entryDate instanceof Date ? tx.entryDate.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));

  const description =
    (tx.purpose?.trim()) ||
    (tx.remoteName?.trim()) ||
    (tx.bookingText?.trim()) ||
    "Transaktion";

  return { date, description, amount: tx.amount, currency };
}

export async function fetchStatements(
  client: FinTSClient,
  accountNumber: string,
  currency: string,
  iban: string,
  holder: string
): Promise<{ result: AccountResult | null; requiresTan: boolean; tanReference?: string; tanChallenge?: string }> {
  const response = await client.getAccountStatements(accountNumber);

  if (response.requiresTan) {
    return { result: null, requiresTan: true, tanReference: response.tanReference, tanChallenge: response.tanChallenge };
  }

  if (!response.success) {
    return { result: null, requiresTan: false };
  }

  const allTx = (response.statements ?? []).flatMap((s: Statement) =>
    s.transactions.map((tx) => txToResult(tx, currency))
  );

  const lastStatement = response.statements?.[response.statements.length - 1];
  const balance = lastStatement?.closingBalance?.value ?? 0;

  return {
    result: { iban, accountNumber, holderName: holder, balance, currency, transactions: allTx },
    requiresTan: false,
  };
}

export async function POST(request: Request) {
  let body: { bankUrl?: string; blz?: string; username?: string; pin?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { bankUrl, blz, username, pin } = body;
  if (!bankUrl || !blz || !username || !pin) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  try {
    const config = FinTSConfig.forFirstTimeUse(
      PRODUCT_ID,
      PRODUCT_VERSION,
      bankUrl,
      blz,
      username,
      pin
    );
    const client = new FinTSClient(config);

    // ── Step 1: First sync (gets BPD / available TAN methods) ────────────────
    let sync1 = await client.synchronize();

    if (sync1.requiresTan) {
      const sessionId = crypto.randomUUID();
      sessions.set(sessionId, { client, pendingAction: "sync", accountsPending: [], accountsDone: [], tanReference: sync1.tanReference });
      setTimeout(() => sessions.delete(sessionId), 5 * 60 * 1000);
      return NextResponse.json({
        sessionId,
        requiresTan: true,
        tanChallenge: sync1.tanChallenge ?? "TAN eingeben",
        tanMediaName: sync1.tanMediaName,
        step: "sync",
      });
    }

    if (!sync1.success) {
      const msgs = sync1.bankAnswers?.map((a) => `${a.code}: ${a.text}`).join("; ") ?? "Unbekannter Fehler";
      return NextResponse.json({ error: `Synchronisation fehlgeschlagen: ${msgs}` }, { status: 422 });
    }

    // Select the first available TAN method
    const tanMethodIds = client.config.bankingInformation?.bpd?.availableTanMethodIds ?? [];
    if (tanMethodIds.length > 0) {
      client.selectTanMethod(tanMethodIds[0]);
    }

    // ── Step 2: Second sync (gets UPD / account list) ────────────────────────
    const sync2 = await client.synchronize();

    if (sync2.requiresTan) {
      const sessionId = crypto.randomUUID();
      sessions.set(sessionId, { client, pendingAction: "sync", accountsPending: [], accountsDone: [], tanReference: sync2.tanReference });
      setTimeout(() => sessions.delete(sessionId), 5 * 60 * 1000);
      return NextResponse.json({
        sessionId,
        requiresTan: true,
        tanChallenge: sync2.tanChallenge ?? "TAN eingeben",
        tanMediaName: sync2.tanMediaName,
        step: "sync",
      });
    }

    const bankAccounts = client.config.bankingInformation?.upd?.bankAccounts ?? [];
    if (bankAccounts.length === 0) {
      return NextResponse.json({ error: "Keine Konten gefunden. Bitte Zugangsdaten prüfen." }, { status: 422 });
    }

    // ── Step 3: Fetch statements for each account ────────────────────────────
    const accountsDone: AccountResult[] = [];
    const accountNumbers = bankAccounts.map((a) => a.accountNumber);

    for (const account of bankAccounts) {
      if (!client.canGetAccountStatements(account.accountNumber)) continue;

      const { result, requiresTan, tanReference, tanChallenge } = await fetchStatements(
        client,
        account.accountNumber,
        account.currency ?? "EUR",
        account.iban ?? account.accountNumber,
        account.holder1 ?? username
      );

      if (requiresTan) {
        const sessionId = crypto.randomUUID();
        const remaining = accountNumbers.slice(accountNumbers.indexOf(account.accountNumber));
        sessions.set(sessionId, { client, pendingAction: "statements", accountsPending: remaining, accountsDone, tanReference });
        setTimeout(() => sessions.delete(sessionId), 5 * 60 * 1000);
        return NextResponse.json({
          sessionId,
          requiresTan: true,
          tanChallenge: tanChallenge ?? "TAN eingeben",
          step: "statements",
        });
      }

      if (result) accountsDone.push(result);
    }

    return NextResponse.json({ accounts: accountsDone });
  } catch (err) {
    console.error("FinTS connect error:", err);
    const raw = err instanceof Error ? err.message : String(err);
    const msg = humanizeFintsError(raw);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

function humanizeFintsError(raw: string): string {
  if (raw.includes("409") || raw.includes("Conflict"))
    return "Die Bank lehnt die Verbindung ab (409). Manche Banken (z. B. Volksbank/VR-Bank) erfordern eine registrierte Produktkennung. Bitte nutze vorerst den Demo-Modus oder wähle eine andere Bank.";
  if (raw.includes("401") || raw.includes("Unauthorized") || raw.includes("Passwort") || raw.includes("PIN") || raw.includes("9010") || raw.includes("9020"))
    return "Benutzername oder PIN falsch. Bitte prüfen.";
  if (raw.includes("403") || raw.includes("Forbidden") || raw.includes("gesperrt"))
    return "Zugang gesperrt. Bitte Online-Banking prüfen.";
  if (raw.includes("ECONNREFUSED") || raw.includes("ENOTFOUND") || raw.includes("fetch failed") || raw.includes("network"))
    return "Bank nicht erreichbar. Bitte später erneut versuchen.";
  if (raw.includes("timeout") || raw.includes("ETIMEDOUT"))
    return "Zeitüberschreitung — Bank antwortet nicht. Bitte erneut versuchen.";
  if (raw.includes("<!DOCTYPE") || raw.includes("<html"))
    return `Bank sendet keine gültige FinTS-Antwort (HTTP-Fehler vom Server der Bank).`;
  return raw.slice(0, 200);
}

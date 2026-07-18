import { NextResponse } from "next/server";
import { sessions, fetchStatements } from "../connect/route";
import type { AccountResult } from "../connect/route";

export async function POST(request: Request) {
  let body: { sessionId?: string; tan?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { sessionId, tan } = body;
  if (!sessionId) {
    return NextResponse.json({ error: "missing_sessionId" }, { status: 400 });
  }

  const session = sessions.get(sessionId);
  if (!session) {
    return NextResponse.json({ error: "session_expired", hint: "Session abgelaufen. Bitte erneut verbinden." }, { status: 404 });
  }

  const { client, pendingAction, accountsPending, accountsDone, tanReference } = session;

  try {
    // ── TAN for sync ────────────────────────────────────────────────────────
    if (pendingAction === "sync") {
      const syncResponse = await client.synchronizeWithTan(tanReference!, tan);

      if (syncResponse.requiresTan) {
        session.tanReference = syncResponse.tanReference;
        return NextResponse.json({
          sessionId,
          requiresTan: true,
          tanChallenge: syncResponse.tanChallenge ?? "TAN eingeben",
          step: "sync",
        });
      }

      if (!syncResponse.success) {
        sessions.delete(sessionId);
        return NextResponse.json({ error: "Synchronisation mit TAN fehlgeschlagen." }, { status: 422 });
      }

      // Select TAN method and do second sync if needed
      const tanMethodIds = client.config.bankingInformation?.bpd?.availableTanMethodIds ?? [];
      if (tanMethodIds.length > 0) {
        client.selectTanMethod(tanMethodIds[0]);
      }

      const sync2 = await client.synchronize();
      if (sync2.requiresTan) {
        session.pendingAction = "sync";
        session.tanReference = sync2.tanReference;
        return NextResponse.json({
          sessionId,
          requiresTan: true,
          tanChallenge: sync2.tanChallenge ?? "TAN eingeben",
          step: "sync",
        });
      }

      // Move on to fetching statements
      const bankAccounts = client.config.bankingInformation?.upd?.bankAccounts ?? [];
      session.pendingAction = "statements";
      session.accountsPending = bankAccounts.map((a) => a.accountNumber);
    }

    // ── TAN for statements (or continuing after sync TAN) ──────────────────
    if (pendingAction === "statements" || session.pendingAction === "statements") {
      // If we have a pending TAN for statements, continue the interaction
      if (pendingAction === "statements" && tanReference) {
        const contResponse = await client.getAccountStatementsWithTan(tanReference, tan);

        if (contResponse.requiresTan) {
          session.tanReference = contResponse.tanReference;
          return NextResponse.json({
            sessionId,
            requiresTan: true,
            tanChallenge: contResponse.tanChallenge ?? "TAN eingeben",
            step: "statements",
          });
        }

        if (contResponse.success && contResponse.statements) {
          const bankAccounts = client.config.bankingInformation?.upd?.bankAccounts ?? [];
          const currentAccountNumber = accountsPending[0];
          const account = bankAccounts.find((a) => a.accountNumber === currentAccountNumber);
          if (account) {
            const allTx = contResponse.statements.flatMap((s) =>
              s.transactions.map((tx) => {
                const date = tx.valueDate instanceof Date
                  ? tx.valueDate.toISOString().slice(0, 10)
                  : new Date().toISOString().slice(0, 10);
                return {
                  date,
                  description: tx.purpose?.trim() || tx.remoteName?.trim() || tx.bookingText?.trim() || "Transaktion",
                  amount: tx.amount,
                  currency: account.currency ?? "EUR",
                };
              })
            );
            const lastStatement = contResponse.statements[contResponse.statements.length - 1];
            accountsDone.push({
              iban: account.iban ?? account.accountNumber,
              accountNumber: account.accountNumber,
              holderName: account.holder1,
              balance: lastStatement?.closingBalance?.value ?? 0,
              currency: account.currency ?? "EUR",
              transactions: allTx,
            });
          }
          session.accountsPending = accountsPending.slice(1);
        }
      }

      // Fetch remaining accounts
      const bankAccounts = client.config.bankingInformation?.upd?.bankAccounts ?? [];
      const remaining = session.accountsPending;

      for (const accountNumber of remaining) {
        const account = bankAccounts.find((a) => a.accountNumber === accountNumber);
        if (!account || !client.canGetAccountStatements(accountNumber)) continue;

        const { result, requiresTan, tanReference: newRef, tanChallenge } = await fetchStatements(
          client,
          accountNumber,
          account.currency ?? "EUR",
          account.iban ?? accountNumber,
          account.holder1
        );

        if (requiresTan) {
          session.tanReference = newRef;
          session.pendingAction = "statements";
          session.accountsPending = remaining.slice(remaining.indexOf(accountNumber));
          return NextResponse.json({
            sessionId,
            requiresTan: true,
            tanChallenge: tanChallenge ?? "TAN eingeben",
            step: "statements",
          });
        }

        if (result) session.accountsDone.push(result);
      }
    }

    // ── Done ────────────────────────────────────────────────────────────────
    const finalAccounts: AccountResult[] = session.accountsDone;
    sessions.delete(sessionId);
    return NextResponse.json({ accounts: finalAccounts });
  } catch (err) {
    sessions.delete(sessionId);
    console.error("FinTS TAN error:", err);
    const raw = err instanceof Error ? err.message : String(err);
    const msg = raw.includes("9010") || raw.includes("9020") || raw.includes("PIN") || raw.includes("TAN")
      ? "TAN falsch oder abgelaufen. Bitte von vorne beginnen."
      : raw.slice(0, 200);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

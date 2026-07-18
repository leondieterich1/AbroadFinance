import { NextResponse } from "next/server";
import {
  getRequisition,
  getAccountDetails,
  getAccountBalances,
  getAccountTransactions,
  isConfigured,
  type GCTransaction,
} from "@/lib/gocardless";

function pickBalance(balances: { balanceAmount: { amount: string; currency: string }; balanceType: string }[]): number {
  // Prefer closingBooked, then interimAvailable, then first
  const preferred = balances.find((b) => b.balanceType === "closingBooked")
    ?? balances.find((b) => b.balanceType === "interimAvailable")
    ?? balances[0];
  return preferred ? parseFloat(preferred.balanceAmount.amount) : 0;
}

function pickCurrency(balances: { balanceAmount: { amount: string; currency: string } }[]): string {
  return balances[0]?.balanceAmount.currency ?? "EUR";
}

function txDescription(tx: GCTransaction): string {
  return (
    tx.remittanceInformationUnstructured?.trim() ||
    tx.remittanceInformationStructured?.trim() ||
    tx.creditorName?.trim() ||
    tx.debtorName?.trim() ||
    "Transaktion"
  );
}

function txDate(tx: GCTransaction): string {
  return tx.bookingDate ?? tx.valueDate ?? new Date().toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  if (!isConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  let body: { requisitionId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { requisitionId } = body;
  if (!requisitionId) {
    return NextResponse.json({ error: "missing_requisitionId" }, { status: 400 });
  }

  try {
    const requisition = await getRequisition(requisitionId);

    if (!requisition.accounts || requisition.accounts.length === 0) {
      return NextResponse.json({ error: "no_accounts", status: requisition.status }, { status: 422 });
    }

    const accounts = await Promise.all(
      requisition.accounts.map(async (accountId) => {
        const [detailsRes, balancesRes, txRes] = await Promise.allSettled([
          getAccountDetails(accountId),
          getAccountBalances(accountId),
          getAccountTransactions(accountId),
        ]);

        const details = detailsRes.status === "fulfilled" ? detailsRes.value.account : {};
        const balances = balancesRes.status === "fulfilled" ? balancesRes.value.balances : [];
        const booked: GCTransaction[] =
          txRes.status === "fulfilled" ? txRes.value.transactions.booked : [];
        const pending: GCTransaction[] =
          txRes.status === "fulfilled" ? txRes.value.transactions.pending : [];

        const allTx = [...booked, ...pending];

        return {
          externalId: accountId,
          iban: details.iban ?? "",
          holderName: details.ownerName ?? details.name ?? "Mein Konto",
          balance: pickBalance(balances),
          currency: pickCurrency(balances) || details.currency || "EUR",
          transactions: allTx.map((tx) => ({
            date: txDate(tx),
            description: txDescription(tx),
            amount: parseFloat(tx.transactionAmount.amount),
            currency: tx.transactionAmount.currency,
          })),
        };
      })
    );

    return NextResponse.json({ accounts });
  } catch (err) {
    console.error("GoCardless fetch error:", err);
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}

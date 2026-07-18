"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAccounts } from "@/hooks/useAccounts";
import { parseCSV, categorize } from "@/lib/categorize";
import { CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/utils";
import { ibanToBlz } from "@/lib/blz-database";
import type { ExpenseCategory } from "@/types";

const DEMO_TX = [
  { date: "2026-07-04", description: "REWE Sagt. Danke",      amount: -32.40 },
  { date: "2026-07-03", description: "Spotify Premium",        amount: -9.99 },
  { date: "2026-07-02", description: "Mietüberweisung Juli",  amount: -750.00 },
  { date: "2026-07-02", description: "ALDI SÜD",              amount: -18.23 },
  { date: "2026-07-01", description: "DB Fernverkehr ICE",    amount: -49.90 },
  { date: "2026-06-30", description: "Netflix",                amount: -12.99 },
  { date: "2026-06-28", description: "Wolt Delivery",         amount: -22.30 },
];

const CATEGORY_OPTIONS: ExpenseCategory[] = ["miete", "essen", "transport", "freizeit", "gesundheit", "sonstiges"];

function fmt(n: number, cur = "EUR") {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: cur, minimumFractionDigits: 2 }).format(n);
}
function maskIban(iban: string) {
  if (!iban || iban.length < 8) return iban || "—";
  return iban.slice(0, 4) + " **** **** **** " + iban.slice(-4);
}
function formatIbanInput(raw: string) {
  return raw.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim();
}

function BankLogo({ logo, name, size = "sm" }: { logo?: string; name: string; size?: "sm" | "lg" | "xl" }) {
  const [failed, setFailed] = useState(false);
  const sz = size === "xl" ? "w-16 h-16" : size === "lg" ? "w-12 h-12" : "w-9 h-9";
  return (
    <div className={`${sz} rounded-2xl bg-white flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm border border-gray-100`}>
      {logo && !failed
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={logo} alt={name} className="w-full h-full object-contain p-1.5" onError={() => setFailed(true)} />
        : <span className="text-xs font-extrabold text-gray-500">{name.slice(0, 2).toUpperCase()}</span>}
    </div>
  );
}

type DiscoveredBank = { name: string; url: string; logo: string; color: string; blz: string; found: boolean };

export default function AccountsPage() {
  const acc = useAccounts();
  const fileRef = useRef<HTMLInputElement>(null);

  type ModalType = "none" | "connect" | "csv" | "transactions" | "quicklog";
  const [modal, setModal] = useState<ModalType>("none");

  // ── Quick expense log (wallet) ─────────────────────────────────────────────
  const [quickAccountId, setQuickAccountId] = useState<string | null>(null);
  const [quickAmount, setQuickAmount] = useState("");
  const [quickDesc, setQuickDesc] = useState("");
  const [quickCategory, setQuickCategory] = useState<ExpenseCategory>("sonstiges");
  const [quickDate, setQuickDate] = useState(new Date().toISOString().slice(0, 10));
  const [quickAutocat, setQuickAutocat] = useState(false);
  const [quickDone, setQuickDone] = useState(false);

  // ── Connect flow: IBAN → discover → credentials → [TAN] → done ─────────────
  type Step = "iban" | "discovering" | "credentials" | "connecting" | "tan" | "done" | "error";
  const [step, setStep] = useState<Step>("iban");
  const [ibanInput, setIbanInput] = useState("");
  const [discoveredBank, setDiscoveredBank] = useState<DiscoveredBank | null>(null);
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [tan, setTan] = useState("");
  const [tanChallenge, setTanChallenge] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [connectError, setConnectError] = useState("");
  const [notFound, setNotFound] = useState(false); // bank not in DB
  const [manualUrl, setManualUrl] = useState("");

  // CSV + transactions
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  const [csvPreview, setCsvPreview] = useState<{ date: string; description: string; amount: number; category: ExpenseCategory; auto: boolean }[]>([]);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvDone, setCsvDone] = useState(false);

  // GoCardless OAuth callback
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref && acc.loaded) {
      window.history.replaceState({}, "", window.location.pathname);
      importGoCardless(ref);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acc.loaded]);

  const importGoCardless = useCallback(async (requisitionId: string) => {
    setModal("connect"); setStep("connecting");
    try {
      const res = await fetch("/api/banks/fetch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requisitionId }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import fehlgeschlagen");
      const instName = localStorage.getItem("gc_inst_name") ?? "Meine Bank";
      const instLogo = localStorage.getItem("gc_inst_logo") ?? undefined;
      for (const a of data.accounts) {
        const account = acc.addAccount({ bankName: instName, bankColor: "#0d1f3c", bankInitials: instName.slice(0, 2).toUpperCase(), bankLogo: instLogo, accountType: "girokonto", holderName: a.holderName, iban: a.iban, balance: a.balance, currency: a.currency, isDemo: false, externalId: a.externalId });
        acc.addTransactions(account.id, a.transactions, a.currency);
      }
      localStorage.removeItem("gc_inst_name"); localStorage.removeItem("gc_inst_logo");
      setStep("done"); setTimeout(() => setModal("none"), 1800);
    } catch (err) { setConnectError(err instanceof Error ? err.message : String(err)); setStep("error"); }
  }, [acc]);

  // ── IBAN input → discover bank ─────────────────────────────────────────────
  function openConnect() {
    setModal("connect"); setStep("iban");
    setIbanInput(""); setDiscoveredBank(null); setUsername(""); setPin("");
    setTan(""); setConnectError(""); setSessionId(null); setNotFound(false); setManualUrl("");
  }

  async function handleIbanSubmit() {
    const clean = ibanInput.replace(/\s/g, "").toUpperCase();
    const blz = ibanToBlz(clean);
    if (!blz) { setConnectError("Ungültige IBAN — bitte prüfen."); return; }

    setStep("discovering");
    setConnectError("");
    try {
      const res = await fetch("/api/fints/discover", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ blz }) });
      const data = await res.json();
      if (data.found) {
        setDiscoveredBank({ ...data, blz });
        setNotFound(false);
        setStep("credentials");
      } else {
        setNotFound(true);
        setDiscoveredBank({ name: "Deine Bank", url: "", logo: "", color: "#0d1f3c", blz, found: false });
        setStep("credentials");
      }
    } catch {
      setConnectError("Verbindung fehlgeschlagen. Bitte erneut versuchen.");
      setStep("iban");
    }
  }

  // ── FinTS connect ──────────────────────────────────────────────────────────
  async function handleConnect() {
    if (!discoveredBank) return;
    const bankUrl = discoveredBank.found ? discoveredBank.url : manualUrl.trim();
    if (!bankUrl) return;
    setStep("connecting");
    try {
      const res = await fetch("/api/fints/connect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bankUrl, blz: discoveredBank.blz, username: username.trim(), pin: pin.trim() }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Verbindung fehlgeschlagen");
      if (data.requiresTan) { setSessionId(data.sessionId); setTanChallenge(data.tanChallenge ?? "TAN eingeben"); setTan(""); setStep("tan"); return; }
      finishImport(data.accounts);
    } catch (err) { setConnectError(err instanceof Error ? err.message : String(err)); setStep("error"); }
  }

  async function handleTan() {
    if (!sessionId || !tan.trim()) return;
    setStep("connecting");
    try {
      const res = await fetch("/api/fints/tan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, tan: tan.trim() }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "TAN fehlgeschlagen");
      if (data.requiresTan) { setTanChallenge(data.tanChallenge ?? "TAN eingeben"); setTan(""); setStep("tan"); return; }
      finishImport(data.accounts);
    } catch (err) { setConnectError(err instanceof Error ? err.message : String(err)); setStep("error"); }
  }

  function finishImport(accounts: { iban: string; accountNumber: string; holderName: string; balance: number; currency: string; transactions: { date: string; description: string; amount: number; currency: string }[] }[]) {
    for (const a of accounts ?? []) {
      const added = acc.addAccount({ bankName: discoveredBank!.name, bankColor: discoveredBank!.color, bankInitials: discoveredBank!.name.slice(0, 2).toUpperCase(), bankLogo: discoveredBank!.logo, accountType: "girokonto", holderName: a.holderName, iban: a.iban, balance: a.balance, currency: a.currency, isDemo: false, externalId: a.accountNumber });
      acc.addTransactions(added.id, a.transactions, a.currency);
    }
    setStep("done"); setTimeout(() => setModal("none"), 1800);
  }

  function handleDemoImport() {
    const bank = discoveredBank ?? { name: "Demo Bank", logo: "", color: "#0d1f3c", blz: "00000000" };
    const account = acc.addAccount({ bankName: bank.name, bankColor: bank.color, bankInitials: bank.name.slice(0, 2).toUpperCase(), bankLogo: bank.logo, accountType: "girokonto", holderName: "Mein Konto", iban: ibanInput.replace(/\s/g, "") || "DE89370400440532013000", balance: 2347.85, currency: "EUR", isDemo: true });
    acc.addTransactions(account.id, DEMO_TX, "EUR");
    setStep("done"); setTimeout(() => setModal("none"), 1500);
  }

  // ── Wallet ─────────────────────────────────────────────────────────────────
  function connectWallet(type: "apple" | "google") {
    acc.addAccount({ bankName: type === "apple" ? "Apple Pay" : "Google Pay", bankColor: type === "apple" ? "#1C1C1E" : "#4285F4", bankInitials: type === "apple" ? "AP" : "GP", accountType: "wallet", holderName: "Wallet", iban: "", balance: 0, currency: "EUR", isDemo: false, walletType: type });
  }

  function openQuickLog(accountId: string) {
    setQuickAccountId(accountId);
    setQuickAmount(""); setQuickDesc(""); setQuickCategory("sonstiges");
    setQuickDate(new Date().toISOString().slice(0, 10));
    setQuickAutocat(false); setQuickDone(false);
    setModal("quicklog");
  }

  function handleQuickDescChange(val: string) {
    setQuickDesc(val);
    if (val.trim().length > 2) {
      const { category, auto } = categorize(val);
      setQuickCategory(category);
      setQuickAutocat(auto);
    }
  }

  function handleQuickSubmit() {
    if (!quickAccountId || !quickAmount || !quickDesc.trim()) return;
    const amount = parseFloat(quickAmount.replace(",", "."));
    if (isNaN(amount) || amount <= 0) return;
    acc.addTransactions(quickAccountId, [{ date: quickDate, description: quickDesc.trim(), amount: -amount }], "EUR");
    setQuickDone(true);
    setTimeout(() => { setQuickDone(false); setModal("none"); }, 1200);
  }

  // ── CSV ────────────────────────────────────────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setCsvLoading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const rows = parseCSV(ev.target?.result as string);
      setCsvPreview(rows.filter((r) => r.amount < 0).slice(0, 50).map((r) => { const { category, auto } = categorize(r.description); return { ...r, amount: Math.abs(r.amount), category, auto }; }));
      setCsvLoading(false);
    };
    reader.readAsText(file, "utf-8");
  }

  function handleCsvImport() {
    if (!activeAccountId || !csvPreview.length) return;
    acc.addTransactions(activeAccountId, csvPreview.map((r) => ({ ...r, amount: -r.amount })), "EUR");
    setCsvDone(true); setTimeout(() => { setModal("none"); setCsvPreview([]); setCsvDone(false); }, 1500);
  }

  const totalBalance = acc.accounts.filter((a) => a.accountType !== "wallet").reduce((s, a) => s + a.balance, 0);
  const ibanClean = ibanInput.replace(/\s/g, "");
  const ibanValid = ibanClean.startsWith("DE") && ibanClean.length === 22;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0d1f3c]">Meine Konten</h1>
          <p className="text-[#0d1f3c]/40 text-sm mt-0.5">Direkte Bankverbindung · Kein Drittanbieter nötig</p>
        </div>
        <button onClick={openConnect} className="bg-[#0d1f3c] text-white font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-[#162d54] transition-colors flex-shrink-0">
          + Konto hinzufügen
        </button>
      </div>

      {/* Balance */}
      {acc.accounts.length > 0 && (
        <div className="bg-[#0d1f3c] text-white rounded-2xl p-5 mb-6 flex items-center justify-between">
          <div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">Gesamtsaldo</p>
            <p className="text-3xl font-extrabold">{fmt(totalBalance)}</p>
            <p className="text-white/40 text-xs mt-1">{acc.accounts.length} Konto{acc.accounts.length !== 1 ? "en" : ""} verknüpft</p>
          </div>
          <div className="text-5xl opacity-20">🏦</div>
        </div>
      )}

      {/* Account cards */}
      {acc.accounts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center mb-6">
          <div className="text-5xl mb-4">🏦</div>
          <h3 className="font-extrabold text-[#0d1f3c] text-lg mb-2">Noch kein Konto verknüpft</h3>
          <p className="text-[#0d1f3c]/40 text-sm mb-6 max-w-sm mx-auto">Gib einfach deine IBAN ein — wir erkennen deine Bank automatisch und stellen die Verbindung her.</p>
          <button onClick={openConnect} className="bg-[#0d1f3c] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#162d54] transition-colors">Bank verbinden →</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {acc.accounts.map((account) => (
            <div key={account.id} className="relative rounded-2xl p-5 text-white overflow-hidden" style={{ background: account.bankColor }}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
              <div className="relative flex items-start justify-between mb-8">
                {account.walletType === "apple" ? (
                  <div className="bg-white rounded-xl px-3 py-1.5 inline-flex items-center gap-1.5 shadow-sm">
                    <svg viewBox="0 0 814 1000" className="w-4 h-4 fill-black" xmlns="http://www.w3.org/2000/svg"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105.7-57.2-155.5-127.4C46.3 680 0 563.7 0 511.8c0-189.7 130.2-277.9 258.7-277.9 66.9 0 122.6 43.5 164.4 43.5 39.5 0 101.7-46 176.5-46 28.6 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/></svg>
                    <span className="text-xs font-bold text-black">Pay</span>
                  </div>
                ) : account.walletType === "google" ? (
                  <div className="bg-white rounded-xl px-3 py-1.5 inline-flex items-center gap-1 shadow-sm">
                    <span className="text-sm font-bold" style={{ color: "#4285F4" }}>G</span>
                    <span className="text-xs font-bold text-gray-700">Pay</span>
                  </div>
                ) : (
                  <BankLogo logo={account.bankLogo} name={account.bankName} />
                )}
                <div className="flex items-center gap-2">
                  {!account.isDemo && account.externalId && <span className="text-[9px] bg-white/20 border border-white/30 px-2 py-0.5 rounded-full font-bold">LIVE</span>}
                  {account.isDemo && <span className="text-[9px] bg-white/20 border border-white/30 px-2 py-0.5 rounded-full font-bold">DEMO</span>}
                  <button onClick={() => acc.removeAccount(account.id)} className="text-white/40 hover:text-white text-xl transition-colors">×</button>
                </div>
              </div>
              <div className="relative">
                {account.accountType !== "wallet" && account.iban && <p className="text-white/50 text-xs font-mono mb-1">{maskIban(account.iban)}</p>}
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-wider mb-0.5">{account.bankName}</p>
                    {account.accountType !== "wallet"
                      ? <p className="text-2xl font-extrabold">{fmt(account.balance, account.currency)}</p>
                      : <p className="text-sm font-semibold text-white/70">{acc.accountTransactions(account.id).length} Ausgabe{acc.accountTransactions(account.id).length !== 1 ? "n" : ""} erfasst</p>}
                  </div>
                  <div className="flex gap-2">
                    {account.accountType === "wallet" && (
                      <button onClick={() => openQuickLog(account.id)} className="text-xs bg-white text-[#0d1f3c] hover:bg-white/90 transition-colors px-3 py-1.5 rounded-lg font-bold shadow-sm">
                        + Ausgabe
                      </button>
                    )}
                    <button onClick={() => { setActiveAccountId(account.id); setModal("transactions"); }} className="text-xs bg-white/20 hover:bg-white/30 transition-colors px-3 py-1.5 rounded-lg font-semibold">
                      Verlauf →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Wallet tiles */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <h2 className="font-extrabold text-[#0d1f3c] mb-1">Bezahldienste</h2>
        <p className="text-[#0d1f3c]/40 text-xs mb-4">Apple Pay & Google Pay verknüpfen</p>
        <div className="grid grid-cols-2 gap-3">
          {(["apple", "google"] as const).map((type) => {
            const connected = acc.accounts.some((a) => a.walletType === type);
            const isApple = type === "apple";
            const icon = isApple
              ? <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center"><svg viewBox="0 0 814 1000" className="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105.7-57.2-155.5-127.4C46.3 680 0 563.7 0 511.8c0-189.7 130.2-277.9 258.7-277.9 66.9 0 122.6 43.5 164.4 43.5 39.5 0 101.7-46 176.5-46 28.6 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/></svg></div>
              : <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="https://logo.clearbit.com/pay.google.com" alt="G Pay" className="w-6 h-6 object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} /></div>;
            const walletAccount = acc.accounts.find((a) => a.walletType === type);
            return connected && walletAccount
              ? <div key={type} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  {icon}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#0d1f3c]">{isApple ? "Apple Pay" : "Google Pay"}</p>
                    <p className="text-xs text-emerald-500 font-semibold">✓ Verbunden</p>
                  </div>
                  <button onClick={() => openQuickLog(walletAccount.id)} className="text-xs bg-[#0d1f3c] text-white px-3 py-1.5 rounded-lg font-bold hover:bg-[#162d54] transition-colors flex-shrink-0">
                    + Ausgabe
                  </button>
                </div>
              : <button key={type} onClick={() => connectWallet(type)} className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-colors border border-dashed border-gray-200">{icon}<div><p className="text-sm font-bold text-[#0d1f3c]">{isApple ? "Apple Pay" : "Google Pay"}</p><p className="text-xs text-[#0d1f3c]/40">Verbinden &amp; Ausgaben erfassen</p></div></button>;
          })}
        </div>
      </div>

      {/* Recent transactions */}
      {acc.transactions.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-extrabold text-[#0d1f3c]">Letzte Transaktionen</h2>
            <span className="text-xs text-[#0d1f3c]/30">{acc.transactions.length} importiert</span>
          </div>
          <div className="divide-y divide-gray-50">
            {acc.transactions.slice(0, 8).map((txn) => (
              <div key={txn.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-base flex-shrink-0">{CATEGORY_ICONS[txn.category]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0d1f3c] truncate">{txn.description}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-[#0d1f3c]/30">{new Date(txn.date).toLocaleDateString("de-DE", { day: "2-digit", month: "short" })}</span>
                    <span className="text-[#0d1f3c]/20">·</span>
                    <span className="text-xs text-[#0d1f3c]/40">{CATEGORY_LABELS[txn.category]}</span>
                    {txn.autoCategorized && <span className="text-[9px] bg-blue-50 text-blue-400 px-1.5 py-0.5 rounded-full font-bold">AUTO</span>}
                  </div>
                </div>
                <span className="text-sm font-bold text-[#0d1f3c] flex-shrink-0">-{fmt(txn.amount, txn.currency)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CSV button */}
      {acc.accounts.length > 0 && (
        <div className="mt-4">
          <button onClick={() => { setModal("csv"); setCsvPreview([]); setCsvDone(false); setActiveAccountId(acc.accounts[0]?.id ?? null); }}
            className="w-full border border-dashed border-gray-200 rounded-2xl py-4 text-sm font-semibold text-[#0d1f3c]/40 hover:border-[#0d1f3c]/30 hover:text-[#0d1f3c]/60 transition-colors flex items-center justify-center gap-2">
            📂 Kontoauszug als CSV importieren
          </button>
        </div>
      )}

      {/* ── CONNECT MODAL ─────────────────────────────────────────────────────── */}
      {modal === "connect" && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget && step !== "connecting" && step !== "discovering") setModal("none"); }}>
          <div className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">

            {/* ── Step 1: IBAN input ───────────────────────────────────────── */}
            {step === "iban" && (
              <div className="flex flex-col">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <div>
                    <h2 className="font-extrabold text-[#0d1f3c] text-lg">Bank verbinden</h2>
                    <p className="text-xs text-[#0d1f3c]/40 mt-0.5">Gib einfach deine IBAN ein</p>
                  </div>
                  <button onClick={() => setModal("none")} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-[#0d1f3c] mb-2">IBAN</label>
                    <input
                      autoFocus
                      type="text"
                      inputMode="text"
                      placeholder="DE89 3704 0044 0532 0130 00"
                      value={ibanInput}
                      onChange={(e) => { setIbanInput(formatIbanInput(e.target.value.toUpperCase())); setConnectError(""); }}
                      onKeyDown={(e) => { if (e.key === "Enter" && ibanValid) handleIbanSubmit(); }}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-lg font-mono tracking-wide text-[#0d1f3c] focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20"
                    />
                    {ibanValid && <p className="text-xs text-emerald-500 font-semibold mt-1.5">✓ Gültige IBAN</p>}
                    {connectError && <p className="text-xs text-rose-500 mt-1.5">{connectError}</p>}
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-[#0d1f3c]/50">💡 Deine IBAN findest du auf deiner Bankkarte oder im Online-Banking unter Kontodetails.</p>
                  </div>
                  <button onClick={handleIbanSubmit} disabled={!ibanValid}
                    className="w-full bg-[#0d1f3c] text-white rounded-xl py-3.5 text-sm font-bold hover:bg-[#162d54] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                    Bank automatisch erkennen →
                  </button>
                  <button onClick={handleDemoImport} className="w-full text-xs text-[#0d1f3c]/30 hover:text-[#0d1f3c]/50 transition-colors py-1">
                    Demo-Daten laden
                  </button>
                </div>
              </div>
            )}

            {/* ── Discovering ─────────────────────────────────────────────── */}
            {step === "discovering" && (
              <div className="p-12 flex flex-col items-center gap-5">
                <div className="w-14 h-14 border-4 border-[#0d1f3c]/10 border-t-[#0d1f3c] rounded-full animate-spin" />
                <div className="text-center">
                  <p className="font-extrabold text-[#0d1f3c] text-lg mb-1">Bank wird erkannt…</p>
                  <p className="text-[#0d1f3c]/40 text-sm">Wir suchen automatisch nach deiner Bank</p>
                </div>
              </div>
            )}

            {/* ── Step 2: Credentials ──────────────────────────────────────── */}
            {step === "credentials" && discoveredBank && (
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <button onClick={() => setStep("iban")} className="text-gray-400 hover:text-gray-600 text-xl">‹</button>
                  <div className="flex items-center gap-3 flex-1 mx-3">
                    {discoveredBank.logo && <BankLogo logo={discoveredBank.logo} name={discoveredBank.name} />}
                    <div>
                      <p className="font-extrabold text-[#0d1f3c] text-sm">{discoveredBank.name}</p>
                      <p className="text-xs text-[#0d1f3c]/40">BLZ {discoveredBank.blz}</p>
                    </div>
                  </div>
                  {discoveredBank.found
                    ? <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-1 rounded-full font-bold flex-shrink-0">✓ Erkannt</span>
                    : <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-2 py-1 rounded-full font-bold flex-shrink-0">Manuell</span>}
                </div>
                <div className="overflow-y-auto flex-1 p-5 space-y-3">
                  {notFound && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 space-y-2">
                      <p className="text-xs font-bold text-amber-700">Bank nicht automatisch gefunden</p>
                      <p className="text-xs text-amber-600">Bitte gib die FinTS-URL deiner Bank ein. Diese findest du auf der Website deiner Bank oder unter fints.de.</p>
                      <input type="url" placeholder="https://banking.meine-bank.de/fints" value={manualUrl} onChange={(e) => setManualUrl(e.target.value)}
                        className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-xs text-[#0d1f3c] bg-white focus:outline-none focus:ring-1 focus:ring-amber-300" />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-[#0d1f3c] mb-1.5">Online-Banking Benutzername</label>
                    <input autoFocus type="text" autoComplete="username" placeholder="Benutzername / Kontonummer" value={username} onChange={(e) => setUsername(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0d1f3c] mb-1.5">PIN / Passwort</label>
                    <input type="password" autoComplete="current-password" placeholder="••••••" value={pin} onChange={(e) => setPin(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleConnect(); }}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20" />
                  </div>
                  <p className="text-[10px] text-[#0d1f3c]/30 text-center">🔒 Zugangsdaten werden nur für diese Verbindung verwendet und niemals gespeichert.</p>
                </div>
                <div className="p-5 border-t border-gray-100 flex gap-3">
                  <button onClick={handleDemoImport} className="text-xs border border-gray-200 px-4 py-3 rounded-xl font-semibold text-[#0d1f3c]/40 hover:bg-gray-50 transition-colors">Demo</button>
                  <button onClick={handleConnect} disabled={!username.trim() || !pin.trim() || (notFound && !manualUrl.trim())}
                    className="flex-1 bg-[#0d1f3c] text-white rounded-xl py-3 text-sm font-bold hover:bg-[#162d54] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                    Verbinden →
                  </button>
                </div>
              </div>
            )}

            {/* ── Connecting ───────────────────────────────────────────────── */}
            {step === "connecting" && (
              <div className="p-12 flex flex-col items-center gap-5">
                <div className="w-14 h-14 border-4 border-[#0d1f3c]/10 border-t-[#0d1f3c] rounded-full animate-spin" />
                <div className="text-center">
                  <p className="font-extrabold text-[#0d1f3c] text-lg mb-1">Verbindung wird hergestellt…</p>
                  <p className="text-[#0d1f3c]/40 text-sm">Transaktionen werden abgerufen</p>
                </div>
              </div>
            )}

            {/* ── TAN ──────────────────────────────────────────────────────── */}
            {step === "tan" && (
              <div className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-xl">🔐</div>
                  <div><h2 className="font-extrabold text-[#0d1f3c]">TAN erforderlich</h2><p className="text-xs text-[#0d1f3c]/40">{discoveredBank?.name}</p></div>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <p className="text-sm font-semibold text-amber-800">{tanChallenge}</p>
                </div>
                <input autoFocus type="text" inputMode="numeric" placeholder="123456" value={tan}
                  onChange={(e) => setTan(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => { if (e.key === "Enter") handleTan(); }}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-xl text-center tracking-widest font-mono text-[#0d1f3c] focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20" />
                <button onClick={handleTan} disabled={!tan.trim()} className="w-full bg-[#0d1f3c] text-white rounded-xl py-3 text-sm font-bold hover:bg-[#162d54] transition-colors disabled:opacity-30">
                  Bestätigen →
                </button>
              </div>
            )}

            {/* ── Done ─────────────────────────────────────────────────────── */}
            {step === "done" && (
              <div className="p-12 flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-3xl">✓</div>
                <p className="font-extrabold text-[#0d1f3c] text-xl">Verbunden!</p>
                <p className="text-[#0d1f3c]/40 text-sm text-center">Transaktionen importiert und automatisch kategorisiert.</p>
              </div>
            )}

            {/* ── Error ────────────────────────────────────────────────────── */}
            {step === "error" && (
              <div className="p-8 flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-3xl">✕</div>
                <p className="font-extrabold text-[#0d1f3c] text-lg">Verbindung fehlgeschlagen</p>
                <div className="w-full bg-rose-50 border border-rose-100 rounded-xl p-3">
                  <p className="text-rose-600 text-sm">{connectError}</p>
                </div>
                <div className="flex gap-3 w-full">
                  <button onClick={() => setStep("credentials")} className="flex-1 border border-gray-200 rounded-xl py-3 text-sm font-semibold text-[#0d1f3c]/60 hover:bg-gray-50 transition-colors">Zurück</button>
                  <button onClick={handleDemoImport} className="flex-1 bg-gray-100 text-[#0d1f3c] rounded-xl py-3 text-sm font-semibold hover:bg-gray-200 transition-colors">Demo laden</button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── CSV MODAL ─────────────────────────────────────────────────────────── */}
      {modal === "csv" && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setModal("none"); }}>
          <div className="bg-white w-full md:max-w-2xl rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
              <h2 className="font-extrabold text-[#0d1f3c] text-lg">Kontoauszug importieren</h2>
              <button onClick={() => setModal("none")} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="overflow-y-auto flex-1 p-5">
              <div className="mb-4">
                <label className="block text-sm font-bold text-[#0d1f3c] mb-1.5">Zu welchem Konto?</label>
                <select value={activeAccountId ?? ""} onChange={(e) => setActiveAccountId(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] bg-white focus:outline-none">
                  {acc.accounts.filter((a) => a.accountType !== "wallet").map((a) => <option key={a.id} value={a.id}>{a.bankName} – {maskIban(a.iban)}</option>)}
                </select>
              </div>
              <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-[#0d1f3c]/30 transition-colors mb-4">
                <p className="text-3xl mb-3">📂</p>
                <p className="font-bold text-[#0d1f3c] mb-1">CSV-Datei hier ablegen</p>
                <p className="text-xs text-[#0d1f3c]/40">Sparkasse · DKB · ING · Commerzbank · Deutsche Bank</p>
                <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFileChange} className="hidden" />
              </div>
              {csvLoading && <div className="flex items-center justify-center gap-3 py-6"><div className="w-5 h-5 border-2 border-[#0d1f3c]/20 border-t-[#0d1f3c] rounded-full animate-spin" /><span className="text-sm text-[#0d1f3c]/50">Wird analysiert…</span></div>}
              {csvPreview.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-[#0d1f3c]">{csvPreview.length} Ausgaben erkannt</p>
                    <p className="text-xs text-[#0d1f3c]/40">{csvPreview.filter((r) => r.auto).length} auto-kategorisiert</p>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {csvPreview.map((row, i) => (
                      <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
                        <span className="text-base flex-shrink-0">{CATEGORY_ICONS[row.category]}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#0d1f3c] truncate">{row.description}</p>
                          <select value={row.category} onChange={(e) => { const n = [...csvPreview]; n[i] = { ...n[i], category: e.target.value as ExpenseCategory, auto: false }; setCsvPreview(n); }} className="text-[10px] text-[#0d1f3c]/60 bg-transparent border-none outline-none cursor-pointer">
                            {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                          </select>
                        </div>
                        <span className="text-xs font-bold text-[#0d1f3c] flex-shrink-0">-{fmt(row.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {csvPreview.length > 0 && (
              <div className="p-5 border-t border-gray-100 flex-shrink-0">
                <button onClick={handleCsvImport} className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${csvDone ? "bg-emerald-500 text-white" : "bg-[#0d1f3c] text-white hover:bg-[#162d54]"}`}>
                  {csvDone ? "✓ Importiert!" : `${csvPreview.length} Transaktionen importieren`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TRANSACTIONS MODAL ────────────────────────────────────────────────── */}
      {modal === "transactions" && activeAccountId && (() => {
        const account = acc.accounts.find((a) => a.id === activeAccountId);
        const txns = acc.accountTransactions(activeAccountId);
        return (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setModal("none"); }}>
            <div className="bg-white w-full md:max-w-xl rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
                <div><h2 className="font-extrabold text-[#0d1f3c]">{account?.bankName}</h2><p className="text-xs text-[#0d1f3c]/40">{txns.length} Transaktionen</p></div>
                <div className="flex items-center gap-3">
                  <button onClick={() => { setModal("csv"); setCsvPreview([]); setCsvDone(false); }} className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg font-semibold text-[#0d1f3c]/60 hover:bg-gray-50 transition-colors">CSV importieren</button>
                  <button onClick={() => setModal("none")} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                </div>
              </div>
              <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
                {txns.length === 0
                  ? <div className="p-10 text-center text-[#0d1f3c]/30 text-sm">Keine Transaktionen</div>
                  : txns.map((txn) => (
                    <div key={txn.id} className="flex items-center gap-3 px-5 py-3.5 group">
                      <span className="text-xl flex-shrink-0">{CATEGORY_ICONS[txn.category]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#0d1f3c] truncate">{txn.description}</p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-[#0d1f3c]/30">{new Date(txn.date).toLocaleDateString("de-DE", { day: "2-digit", month: "short" })}</span>
                          <select value={txn.category} onChange={(e) => acc.updateCategory(txn.id, e.target.value as ExpenseCategory)} className="text-xs text-[#0d1f3c]/50 bg-transparent border-none outline-none cursor-pointer">
                            {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                          </select>
                          {txn.autoCategorized && <span className="text-[9px] bg-blue-50 text-blue-400 px-1.5 py-0.5 rounded-full font-bold">AUTO</span>}
                        </div>
                      </div>
                      <span className="text-sm font-bold text-[#0d1f3c]">-{fmt(txn.amount, txn.currency)}</span>
                      <button onClick={() => acc.deleteTransaction(txn.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-rose-400 transition-all text-lg">×</button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── QUICK LOG MODAL ───────────────────────────────────────────────────── */}
      {modal === "quicklog" && quickAccountId && (() => {
        const walletAccount = acc.accounts.find((a) => a.id === quickAccountId);
        const isApple = walletAccount?.walletType === "apple";
        const accentColor = isApple ? "#1C1C1E" : "#4285F4";
        return (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/40 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget && !quickDone) setModal("none"); }}>
            <div className="bg-white w-full md:max-w-sm rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden">

              {/* Header */}
              <div className="flex items-center gap-3 p-5 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: accentColor }}>
                  {isApple ? "AP" : "GP"}
                </div>
                <div className="flex-1">
                  <h2 className="font-extrabold text-[#0d1f3c]">Ausgabe erfassen</h2>
                  <p className="text-xs text-[#0d1f3c]/40">{walletAccount?.bankName}</p>
                </div>
                <button onClick={() => setModal("none")} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
              </div>

              {quickDone ? (
                <div className="p-12 flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center text-2xl">✓</div>
                  <p className="font-extrabold text-[#0d1f3c]">Ausgabe gespeichert!</p>
                </div>
              ) : (
                <div className="p-5 space-y-4">
                  {/* Amount — big and prominent */}
                  <div>
                    <label className="block text-xs font-bold text-[#0d1f3c]/50 uppercase tracking-widest mb-2">Betrag</label>
                    <div className="flex items-center gap-2 border-2 border-gray-100 rounded-2xl px-4 py-3 focus-within:border-[#0d1f3c]/20">
                      <span className="text-2xl font-extrabold text-[#0d1f3c]/30">€</span>
                      <input
                        autoFocus
                        type="text"
                        inputMode="decimal"
                        placeholder="0,00"
                        value={quickAmount}
                        onChange={(e) => setQuickAmount(e.target.value.replace(/[^0-9.,]/g, ""))}
                        onKeyDown={(e) => { if (e.key === "Enter") handleQuickSubmit(); }}
                        className="flex-1 text-3xl font-extrabold text-[#0d1f3c] bg-transparent focus:outline-none placeholder:text-gray-200 w-full"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-[#0d1f3c]/50 uppercase tracking-widest mb-2">Beschreibung</label>
                    <input
                      type="text"
                      placeholder="z. B. Starbucks, Uber, Rewe …"
                      value={quickDesc}
                      onChange={(e) => handleQuickDescChange(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleQuickSubmit(); }}
                      className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/10 bg-gray-50"
                    />
                  </div>

                  {/* Category + Date row */}
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-[#0d1f3c]/50 uppercase tracking-widest mb-2">Kategorie</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base">{CATEGORY_ICONS[quickCategory]}</span>
                        <select value={quickCategory} onChange={(e) => { setQuickCategory(e.target.value as ExpenseCategory); setQuickAutocat(false); }}
                          className="w-full border border-gray-100 rounded-xl pl-9 pr-3 py-3 text-sm text-[#0d1f3c] bg-gray-50 focus:outline-none appearance-none cursor-pointer">
                          {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                        </select>
                        {quickAutocat && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] bg-blue-50 text-blue-400 px-1.5 py-0.5 rounded-full font-bold">AUTO</span>}
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-[#0d1f3c]/50 uppercase tracking-widest mb-2">Datum</label>
                      <input type="date" value={quickDate} onChange={(e) => setQuickDate(e.target.value)}
                        className="w-full border border-gray-100 rounded-xl px-3 py-3 text-sm text-[#0d1f3c] bg-gray-50 focus:outline-none" />
                    </div>
                  </div>

                  {/* Quick amount chips */}
                  <div className="flex gap-2">
                    {["5", "10", "20", "50"].map((v) => (
                      <button key={v} onClick={() => setQuickAmount(v)}
                        className="flex-1 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-sm font-bold text-[#0d1f3c]/60 transition-colors border border-gray-100">
                        {v} €
                      </button>
                    ))}
                  </div>

                  <button onClick={handleQuickSubmit}
                    disabled={!quickAmount || !quickDesc.trim()}
                    className="w-full py-4 rounded-2xl text-white font-extrabold text-base transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ background: accentColor }}>
                    Ausgabe speichern
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

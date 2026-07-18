"use client";

import { useState, useMemo } from "react";
import { useAccounts } from "@/hooks/useAccounts";
import { usePlanner } from "@/hooks/usePlanner";
import { CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_COLORS, CURRENCIES } from "@/lib/utils";
import { categorize } from "@/lib/categorize";
import type { ExpenseCategory } from "@/types";

const CATEGORIES: ExpenseCategory[] = ["miete", "essen", "transport", "freizeit", "gesundheit", "sonstiges"];

function fmt(n: number, cur = "EUR") {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: cur, minimumFractionDigits: 2 }).format(n);
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtShort(d: string) {
  return new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "short" });
}

type UnifiedTx = {
  id: string;
  description: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  date: string;
  source: "bank" | "manual" | "wallet";
  accountName?: string;
  accountColor?: string;
  autoCategorized?: boolean;
};

// Mini bar chart component
function CategoryBar({ category, amount, total, color }: { category: ExpenseCategory; amount: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-base w-6 text-center flex-shrink-0">{CATEGORY_ICONS[category]}</span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-semibold text-[#0d1f3c]">{CATEGORY_LABELS[category]}</span>
          <span className="text-xs font-bold text-[#0d1f3c]">{fmt(amount)}</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
        </div>
      </div>
      <span className="text-xs text-[#0d1f3c]/30 w-8 text-right flex-shrink-0">{pct}%</span>
    </div>
  );
}

export default function TransactionsPage() {
  const acc = useAccounts();
  const planner = usePlanner();

  // ── Add form state ─────────────────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formCategory, setFormCategory] = useState<ExpenseCategory>("essen");
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formCur, setFormCur] = useState("EUR");
  const [formAutocat, setFormAutocat] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  // ── Filters ────────────────────────────────────────────────────────────────
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | "alle">("alle");
  const [filterSource, setFilterSource] = useState<"alle" | "bank" | "manual" | "wallet">("alle");
  const [search, setSearch] = useState("");
  const [sortDesc, setSortDesc] = useState(true);

  // ── Merge all transactions ─────────────────────────────────────────────────
  const allTx = useMemo<UnifiedTx[]>(() => {
    const bankTxs: UnifiedTx[] = acc.transactions.map((tx) => {
      const account = acc.accounts.find((a) => a.id === tx.accountId);
      return {
        id: tx.id,
        description: tx.description,
        amount: tx.amount,
        currency: tx.currency,
        category: tx.category,
        date: tx.date,
        source: account?.walletType ? "wallet" : "bank",
        accountName: account?.bankName,
        accountColor: account?.bankColor,
        autoCategorized: tx.autoCategorized,
      };
    });

    const plannerTxs: UnifiedTx[] = planner.expenses.map((e) => ({
      id: e.id,
      description: e.title,
      amount: e.amount,
      currency: e.currency,
      category: e.category,
      date: e.date,
      source: "manual" as const,
      accountName: "Manuell",
    }));

    return [...bankTxs, ...plannerTxs].sort((a, b) =>
      sortDesc ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)
    );
  }, [acc.transactions, acc.accounts, planner.expenses, sortDesc]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const thisMonth = useMemo(() => {
    const now = new Date();
    const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return allTx.filter((t) => t.date.startsWith(prefix));
  }, [allTx]);

  const totalThisMonth = thisMonth.reduce((s, t) => s + t.amount, 0);
  const totalAll = allTx.reduce((s, t) => s + t.amount, 0);

  const byCategory = useMemo(() => {
    const map: Partial<Record<ExpenseCategory, number>> = {};
    for (const tx of allTx) {
      map[tx.category] = (map[tx.category] ?? 0) + tx.amount;
    }
    return map;
  }, [allTx]);

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => allTx.filter((tx) => {
    if (filterCategory !== "alle" && tx.category !== filterCategory) return false;
    if (filterSource !== "alle" && tx.source !== filterSource) return false;
    if (search.trim() && !tx.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [allTx, filterCategory, filterSource, search]);

  // ── Group by date ──────────────────────────────────────────────────────────
  const grouped = useMemo(() => {
    const map = new Map<string, UnifiedTx[]>();
    for (const tx of filtered) {
      const key = tx.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(tx);
    }
    return Array.from(map.entries());
  }, [filtered]);

  // ── Form handlers ──────────────────────────────────────────────────────────
  function handleDescChange(val: string) {
    setFormTitle(val);
    if (val.trim().length > 2) {
      const { category, auto } = categorize(val);
      setFormCategory(category);
      setFormAutocat(auto);
    }
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!formTitle.trim() || !formAmount || parseFloat(formAmount) <= 0) return;
    planner.addExpense({ title: formTitle.trim(), amount: parseFloat(formAmount.replace(",", ".")), currency: formCur, category: formCategory, date: formDate });
    setFormTitle(""); setFormAmount(""); setFormAutocat(false);
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 1500);
  }

  function handleDelete(tx: UnifiedTx) {
    if (tx.source === "manual") planner.deleteExpense(tx.id);
    else acc.deleteTransaction(tx.id);
  }

  const topCategories = CATEGORIES
    .map((c) => ({ category: c, amount: byCategory[c] ?? 0 }))
    .filter((x) => x.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0d1f3c]">Transaktionen</h1>
          <p className="text-[#0d1f3c]/40 text-sm mt-0.5">{allTx.length} Ausgaben · {acc.accounts.length} Konto{acc.accounts.length !== 1 ? "en" : ""} verknüpft</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)}
          className="bg-[#0d1f3c] text-white font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-[#162d54] transition-colors flex-shrink-0">
          + Ausgabe
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Dieser Monat", value: fmt(totalThisMonth), sub: `${thisMonth.length} Buchungen` },
          { label: "Gesamt", value: fmt(totalAll), sub: `${allTx.length} Buchungen` },
          { label: "Größte Kategorie", value: topCategories[0] ? CATEGORY_LABELS[topCategories[0].category] : "—", sub: topCategories[0] ? fmt(topCategories[0].amount) : "Keine Daten" },
          { label: "Quellen", value: `${acc.accounts.length + (planner.expenses.length > 0 ? 1 : 0)}`, sub: `${acc.accounts.length > 0 ? "Bank" : ""}${acc.accounts.length > 0 && planner.expenses.length > 0 ? " + " : ""}${planner.expenses.length > 0 ? "Manuell" : ""}` || "Keine" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-[#0d1f3c]/40 text-xs font-semibold mb-1">{s.label}</p>
            <p className="text-lg font-extrabold text-[#0d1f3c] leading-tight">{s.value}</p>
            <p className="text-[#0d1f3c]/30 text-xs mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-[1fr_280px] gap-6">
        {/* Left: transactions list */}
        <div className="min-w-0">

          {/* Add form (collapsible) */}
          {showForm && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
              <h2 className="font-extrabold text-[#0d1f3c] mb-4">Ausgabe manuell erfassen</h2>
              <form onSubmit={handleAdd} className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input type="text" placeholder="Beschreibung (z. B. Rewe, Spotify…)" value={formTitle}
                      onChange={(e) => handleDescChange(e.target.value)} required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20" />
                  </div>
                  <div className="flex gap-2 w-44">
                    <input type="text" inputMode="decimal" placeholder="0,00" value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value.replace(/[^0-9.,]/g, ""))} required
                      className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-[#0d1f3c] focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20" />
                    <select value={formCur} onChange={(e) => setFormCur(e.target.value)}
                      className="border border-gray-200 rounded-xl px-2 py-3 text-sm text-[#0d1f3c] bg-white focus:outline-none w-20">
                      {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 items-center flex-wrap">
                  <div className="flex gap-1.5 flex-wrap">
                    {CATEGORIES.map((cat) => (
                      <button key={cat} type="button" onClick={() => { setFormCategory(cat); setFormAutocat(false); }}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${formCategory === cat ? "border-[#0d1f3c] bg-[#0d1f3c] text-white" : "border-gray-200 text-[#0d1f3c]/60 hover:border-[#0d1f3c]/30"}`}>
                        {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat].split(" ")[0]}
                        {formCategory === cat && formAutocat && <span className="text-[9px] bg-white/20 px-1 rounded">AUTO</span>}
                      </button>
                    ))}
                  </div>
                  <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm text-[#0d1f3c] focus:outline-none ml-auto" />
                  <button type="submit"
                    className={`px-5 py-1.5 rounded-xl text-sm font-bold transition-all ${formSuccess ? "bg-emerald-500 text-white" : "bg-[#0d1f3c] text-white hover:bg-[#162d54]"}`}>
                    {formSuccess ? "✓ Gespeichert" : "Speichern"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4 items-center">
            <div className="flex-1 min-w-48">
              <input type="text" placeholder="Suchen…" value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-100 rounded-xl px-4 py-2 text-sm text-[#0d1f3c] bg-white focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/10" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {(["alle", ...CATEGORIES] as const).map((cat) => {
                const count = cat === "alle" ? filtered.length : allTx.filter((t) => t.category === cat).length;
                if (cat !== "alle" && count === 0) return null;
                return (
                  <button key={cat} onClick={() => setFilterCategory(cat as typeof filterCategory)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterCategory === cat ? "bg-[#0d1f3c] text-white" : "bg-white text-[#0d1f3c]/50 hover:text-[#0d1f3c] border border-gray-100"}`}>
                    {cat === "alle" ? `Alle (${allTx.length})` : `${CATEGORY_ICONS[cat]} ${CATEGORY_LABELS[cat].split(" ")[0]} (${count})`}
                  </button>
                );
              })}
            </div>
            <button onClick={() => setSortDesc((v) => !v)}
              className="text-xs border border-gray-100 bg-white px-3 py-1.5 rounded-full text-[#0d1f3c]/50 hover:text-[#0d1f3c] transition-colors font-semibold">
              {sortDesc ? "↓ Neueste" : "↑ Älteste"}
            </button>
          </div>

          {/* Transaction list */}
          {allTx.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
              <p className="text-4xl mb-4">💸</p>
              <p className="font-extrabold text-[#0d1f3c] text-lg mb-2">Noch keine Ausgaben</p>
              <p className="text-[#0d1f3c]/40 text-sm">Verbinde dein Bankkonto oder erfasse Ausgaben manuell.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <p className="text-[#0d1f3c]/30 text-sm">Keine Treffer für die aktuelle Filterung.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {grouped.map(([date, txns]) => (
                <div key={date}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-[#0d1f3c]/40 uppercase tracking-widest">{fmtDate(date)}</span>
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-xs font-bold text-[#0d1f3c]/30">-{fmt(txns.reduce((s, t) => s + t.amount, 0))}</span>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
                    {txns.map((tx) => (
                      <div key={tx.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/60 transition-colors group">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                          style={{ background: `${CATEGORY_COLORS[tx.category]}18` }}>
                          {CATEGORY_ICONS[tx.category]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#0d1f3c] truncate">{tx.description}</p>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            {tx.accountName && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                                style={{ background: tx.accountColor ? `${tx.accountColor}20` : "#0d1f3c10", color: tx.accountColor ?? "#0d1f3c" }}>
                                {tx.accountName}
                              </span>
                            )}
                            <span className="text-xs text-[#0d1f3c]/30">{CATEGORY_LABELS[tx.category]}</span>
                            {tx.autoCategorized && <span className="text-[9px] bg-blue-50 text-blue-400 px-1.5 py-0.5 rounded-full font-bold">AUTO</span>}
                            {tx.source === "manual" && <span className="text-[9px] bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded-full font-bold border border-gray-100">MANUELL</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-sm font-bold text-[#0d1f3c]">-{fmt(tx.amount, tx.currency)}</span>
                          <button onClick={() => handleDelete(tx)}
                            className="opacity-0 group-hover:opacity-100 text-gray-200 hover:text-rose-400 transition-all text-xl leading-none">×</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <p className="text-center text-xs text-[#0d1f3c]/20 py-2">{filtered.length} Ausgaben · Gesamt {fmt(filtered.reduce((s, t) => s + t.amount, 0))}</p>
            </div>
          )}
        </div>

        {/* Right: breakdown */}
        <div className="space-y-4">

          {/* This month summary */}
          <div className="bg-[#0d1f3c] text-white rounded-2xl p-5">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">Dieser Monat</p>
            <p className="text-3xl font-extrabold mb-0.5">{fmt(totalThisMonth)}</p>
            <p className="text-white/40 text-xs">{thisMonth.length} Buchungen</p>
            {totalAll > 0 && (
              <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-white/60 rounded-full" style={{ width: `${Math.min(100, (totalThisMonth / totalAll) * 100)}%` }} />
              </div>
            )}
          </div>

          {/* Category breakdown */}
          {topCategories.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-extrabold text-[#0d1f3c] mb-4">Nach Kategorie</h3>
              <div className="space-y-3">
                {topCategories.map(({ category, amount }) => (
                  <CategoryBar key={category} category={category} amount={amount} total={totalAll}
                    color={CATEGORY_COLORS[category]} />
                ))}
              </div>
            </div>
          )}

          {/* Source breakdown */}
          {allTx.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-extrabold text-[#0d1f3c] mb-4">Nach Quelle</h3>
              <div className="space-y-2">
                {(["bank", "wallet", "manual"] as const).map((src) => {
                  const count = allTx.filter((t) => t.source === src).length;
                  const total = allTx.filter((t) => t.source === src).reduce((s, t) => s + t.amount, 0);
                  if (count === 0) return null;
                  const label = src === "bank" ? "🏦 Bank" : src === "wallet" ? "💳 Wallet" : "✏️ Manuell";
                  return (
                    <button key={src} onClick={() => setFilterSource(filterSource === src ? "alle" : src)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${filterSource === src ? "bg-[#0d1f3c] text-white" : "bg-gray-50 hover:bg-gray-100 text-[#0d1f3c]"}`}>
                      <span className="font-semibold">{label}</span>
                      <div className="text-right">
                        <p className="font-bold text-xs">{fmt(total)}</p>
                        <p className={`text-[10px] ${filterSource === src ? "text-white/50" : "text-[#0d1f3c]/30"}`}>{count} Buchungen</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick shortcuts */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-extrabold text-[#0d1f3c] mb-3">Schnellfilter</h3>
            <div className="space-y-1">
              {[
                { label: "Heute", filter: () => { const d = new Date().toISOString().slice(0,10); return allTx.filter(t => t.date === d); } },
                { label: "Diese Woche", filter: () => { const now = new Date(); const mon = new Date(now); mon.setDate(now.getDate() - now.getDay() + 1); return allTx.filter(t => new Date(t.date) >= mon); } },
              ].map(({ label, filter }) => {
                const count = filter().length;
                return (
                  <div key={label} className="flex items-center justify-between px-3 py-2 rounded-xl text-sm text-[#0d1f3c]/60 bg-gray-50">
                    <span>{label}</span>
                    <span className="font-bold text-[#0d1f3c]">{fmt(filter().reduce((s, t) => s + t.amount, 0))}</span>
                  </div>
                );
              })}
              <div className="flex items-center justify-between px-3 py-2 rounded-xl text-sm text-[#0d1f3c]/60 bg-gray-50">
                <span>Letzter Monat</span>
                <span className="font-bold text-[#0d1f3c]">{(() => {
                  const now = new Date();
                  const prefix = `${now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()}-${String(now.getMonth() === 0 ? 12 : now.getMonth()).padStart(2, "0")}`;
                  return fmt(allTx.filter(t => t.date.startsWith(prefix)).reduce((s, t) => s + t.amount, 0));
                })()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

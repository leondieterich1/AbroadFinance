"use client";

import { useState } from "react";
import { usePlanner } from "@/hooks/usePlanner";
import { formatCurrency, formatDate, CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_COLORS, CURRENCIES } from "@/lib/utils";
import type { ExpenseCategory } from "@/types";

const CATEGORIES: ExpenseCategory[] = ["miete", "essen", "transport", "freizeit", "gesundheit", "sonstiges"];

export default function TransactionsPage() {
  const planner = usePlanner();
  const currency = planner.budgets[0]?.currency ?? "EUR";

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("essen");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [cur, setCur] = useState(currency);
  const [success, setSuccess] = useState(false);
  const [filter, setFilter] = useState<ExpenseCategory | "alle">("alle");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !amount || parseFloat(amount) <= 0) return;
    planner.addExpense({ title: title.trim(), amount: parseFloat(amount), currency: cur, category, date });
    setTitle(""); setAmount("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 1500);
  }

  const filtered = filter === "alle"
    ? planner.expenses
    : planner.expenses.filter((e) => e.category === filter);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-extrabold text-[#0d1f3c] mb-1">Ausgaben</h1>
      <p className="text-[#0d1f3c]/40 text-sm mb-8">Erfasse und verwalte all deine Ausgaben.</p>

      <div className="grid md:grid-cols-[380px_1fr] gap-6">
        {/* Add form */}
        <div className="bg-white rounded-2xl shadow-sm p-6 h-fit">
          <h2 className="font-extrabold text-[#0d1f3c] mb-5">Neue Ausgabe</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#0d1f3c] mb-1.5">Bezeichnung</label>
              <input
                type="text" placeholder="z.B. Supermarkt, Miete…"
                value={title} onChange={(e) => setTitle(e.target.value)} required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0d1f3c] mb-1.5">Betrag</label>
              <div className="flex gap-2">
                <input
                  type="number" placeholder="0,00" min="0.01" step="0.01"
                  value={amount} onChange={(e) => setAmount(e.target.value)} required
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20"
                />
                <select
                  value={cur} onChange={(e) => setCur(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-3 text-sm text-[#0d1f3c] bg-white focus:outline-none"
                >
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0d1f3c] mb-2">Kategorie</label>
              <div className="grid grid-cols-3 gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat} type="button" onClick={() => setCategory(cat)}
                    className={`flex items-center gap-1.5 px-2 py-2 rounded-xl border text-xs font-medium transition-all ${
                      category === cat ? "border-[#0d1f3c] bg-[#0d1f3c] text-white" : "border-gray-200 text-[#0d1f3c]/60 hover:border-[#0d1f3c]/30"
                    }`}
                  >
                    <span>{CATEGORY_ICONS[cat]}</span>
                    <span className="truncate">{CATEGORY_LABELS[cat].split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0d1f3c] mb-1.5">Datum</label>
              <input
                type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20"
              />
            </div>
            <button
              type="submit"
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${success ? "bg-emerald-500 text-white" : "bg-[#0d1f3c] text-white hover:bg-[#162d54]"}`}
            >
              {success ? "✓ Gespeichert!" : "Ausgabe hinzufügen"}
            </button>
          </form>
        </div>

        {/* List */}
        <div>
          {/* Filter */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              onClick={() => setFilter("alle")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === "alle" ? "bg-[#0d1f3c] text-white" : "bg-white text-[#0d1f3c]/50 hover:text-[#0d1f3c] shadow-sm"}`}
            >
              Alle ({planner.expenses.length})
            </button>
            {CATEGORIES.map((cat) => {
              const count = planner.expenses.filter((e) => e.category === cat).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === cat ? "bg-[#0d1f3c] text-white" : "bg-white text-[#0d1f3c]/50 hover:text-[#0d1f3c] shadow-sm"}`}
                >
                  {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat].split(" ")[0]} ({count})
                </button>
              );
            })}
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <p className="text-4xl mb-3">💸</p>
              <p className="text-[#0d1f3c]/40 font-medium">Keine Ausgaben gefunden.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-50">
              {/* Summary row */}
              <div className="px-5 py-3 bg-gray-50/80 rounded-t-2xl flex justify-between items-center">
                <span className="text-xs font-semibold text-[#0d1f3c]/40 uppercase tracking-wider">
                  {filtered.length} Ausgabe{filtered.length !== 1 ? "n" : ""}
                </span>
                <span className="text-xs font-bold text-[#0d1f3c]">
                  Gesamt: {formatCurrency(filtered.reduce((s, e) => s + e.amount, 0), currency)}
                </span>
              </div>
              {filtered.map((e) => (
                <div key={e.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                      style={{ backgroundColor: `${CATEGORY_COLORS[e.category]}18` }}
                    >
                      {CATEGORY_ICONS[e.category]}
                    </div>
                    <div>
                      <p className="font-semibold text-[#0d1f3c] text-sm">{e.title}</p>
                      <p className="text-[#0d1f3c]/40 text-xs">{CATEGORY_LABELS[e.category]} · {formatDate(e.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#0d1f3c]">{formatCurrency(e.amount, e.currency)}</span>
                    <button
                      onClick={() => planner.deleteExpense(e.id)}
                      className="opacity-0 group-hover:opacity-100 text-[#0d1f3c]/20 hover:text-rose-500 transition-all text-xl leading-none"
                    >×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

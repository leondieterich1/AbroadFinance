"use client";

import { usePlanner } from "@/hooks/usePlanner";
import { formatCurrency, CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_COLORS, CURRENCIES } from "@/lib/utils";
import { useState } from "react";
import type { ExpenseCategory } from "@/types";

const CATEGORIES: ExpenseCategory[] = ["miete", "essen", "transport", "freizeit", "gesundheit", "sonstiges"];

export default function BudgetPage() {
  const planner = usePlanner();
  const currency = planner.budgets[0]?.currency ?? "EUR";
  const [cur, setCur] = useState(currency);
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(planner.budgets.map((b) => [b.category, String(b.limit)]))
  );
  const [saved, setSaved] = useState(false);

  const total = CATEGORIES.reduce((sum, cat) => sum + (parseFloat(values[cat]) || 0), 0);

  function handleSave() {
    CATEGORIES.forEach((cat) => {
      const val = parseFloat(values[cat]);
      if (!isNaN(val) && val >= 0) planner.updateBudget(cat, val);
    });
    planner.setCurrency(cur);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-extrabold text-[#0d1f3c] mb-1">Budget verwalten</h1>
      <p className="text-[#0d1f3c]/40 text-sm mb-8">Lege dein monatliches Budget pro Kategorie fest.</p>

      {/* Category bars */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="font-extrabold text-[#0d1f3c] mb-5">Aktueller Stand</h2>
        <div className="space-y-5">
          {planner.budgets.map((b) => {
            const spent = planner.spentFor(b.category);
            const pct = b.limit > 0 ? Math.min((spent / b.limit) * 100, 100) : 0;
            const over = spent > b.limit;
            return (
              <div key={b.category}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-semibold text-[#0d1f3c] flex items-center gap-1.5">
                    {CATEGORY_ICONS[b.category]} {CATEGORY_LABELS[b.category]}
                    {over && <span className="text-xs bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full ml-1">Überzogen</span>}
                  </span>
                  <span className="text-xs text-[#0d1f3c]/50">
                    {formatCurrency(spent, currency)} / {formatCurrency(b.limit, currency)}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: over ? "#f43f5e" : CATEGORY_COLORS[b.category] }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit budget */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-extrabold text-[#0d1f3c] mb-5">Budget bearbeiten</h2>

        <div className="mb-5">
          <label className="block text-sm font-semibold text-[#0d1f3c] mb-1.5">Hauptwährung</label>
          <select
            value={cur}
            onChange={(e) => setCur(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] bg-white focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20"
          >
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="space-y-4 mb-6">
          {CATEGORIES.map((cat) => (
            <div key={cat}>
              <label className="flex items-center gap-2 text-sm font-semibold text-[#0d1f3c] mb-1.5">
                {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
              </label>
              <div className="relative">
                <input
                  type="number" min="0" step="10"
                  value={values[cat]}
                  onChange={(e) => setValues((v) => ({ ...v, [cat]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-16 text-sm text-[#0d1f3c] focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#0d1f3c]/40 font-medium">{cur}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center py-4 border-t border-gray-100 mb-5">
          <span className="font-semibold text-[#0d1f3c]">Gesamt</span>
          <span className="text-xl font-extrabold text-[#0d1f3c]">{formatCurrency(total, cur)}</span>
        </div>

        <button
          onClick={handleSave}
          className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${saved ? "bg-emerald-500 text-white" : "bg-[#0d1f3c] text-white hover:bg-[#162d54]"}`}
        >
          {saved ? "✓ Budget gespeichert!" : "Budget speichern"}
        </button>
      </div>
    </div>
  );
}

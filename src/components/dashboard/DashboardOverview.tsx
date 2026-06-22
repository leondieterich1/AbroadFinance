"use client";

import Link from "next/link";
import { usePlanner } from "@/hooks/usePlanner";
import { formatCurrency, CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_COLORS } from "@/lib/utils";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Guten Morgen";
  if (h < 18) return "Guten Tag";
  return "Guten Abend";
}

export default function DashboardOverview({ userName }: { userName: string }) {
  const planner = usePlanner();
  const currency = planner.budgets[0]?.currency ?? "EUR";
  const totalBudget = planner.totalBudget();
  const totalSpent = planner.totalSpent();
  const remaining = totalBudget - totalSpent;
  const pct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  const today = new Date().toLocaleDateString("de-DE", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const topCategories = planner.budgets
    .map((b) => ({ ...b, spent: planner.spentFor(b.category) }))
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 3);

  const recentExpenses = planner.expenses.slice(0, 5);

  if (!planner.loaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#0d1f3c]/20 border-t-[#0d1f3c] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[#0d1f3c]/40 text-sm mb-1">{today}</p>
        <h1 className="text-3xl font-extrabold text-[#0d1f3c]">
          {getGreeting()}, {userName.split(" ")[0]} 👋
        </h1>
        <p className="text-[#0d1f3c]/50 mt-1">Hier ist deine Finanzübersicht für diesen Monat.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#0d1f3c] text-white rounded-2xl p-5">
          <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">Monatsbudget</p>
          <p className="text-3xl font-extrabold">{formatCurrency(totalBudget, currency)}</p>
          <p className="text-white/40 text-xs mt-2">Gesamt verfügbar</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-[#0d1f3c]/50 text-xs font-semibold uppercase tracking-wider mb-2">Ausgegeben</p>
          <p className="text-3xl font-extrabold text-rose-500">{formatCurrency(totalSpent, currency)}</p>
          <p className="text-[#0d1f3c]/30 text-xs mt-2">{pct.toFixed(0)}% des Budgets</p>
        </div>
        <div className={`rounded-2xl p-5 shadow-sm ${remaining < 0 ? "bg-rose-50" : "bg-emerald-50"}`}>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${remaining < 0 ? "text-rose-400" : "text-emerald-600/70"}`}>
            Verbleibend
          </p>
          <p className={`text-3xl font-extrabold ${remaining < 0 ? "text-rose-500" : "text-emerald-600"}`}>
            {formatCurrency(remaining, currency)}
          </p>
          <p className={`text-xs mt-2 ${remaining < 0 ? "text-rose-400" : "text-emerald-600/50"}`}>
            {remaining < 0 ? "Budget überzogen!" : "noch verfügbar"}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-[#0d1f3c]">Budget-Fortschritt</span>
          <span className="text-sm text-[#0d1f3c]/40">{pct.toFixed(1)}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${pct >= 100 ? "bg-rose-500" : pct >= 80 ? "bg-amber-400" : "bg-emerald-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-[#0d1f3c]/30 mt-2">
          <span>0</span>
          <span>{formatCurrency(totalBudget, currency)}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top categories */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-[#0d1f3c]">Top Kategorien</h2>
            <Link href="/dashboard/budget" className="text-xs text-[#0d1f3c]/40 hover:text-[#0d1f3c] transition-colors">
              Alle →
            </Link>
          </div>
          {topCategories.every((c) => c.spent === 0) ? (
            <p className="text-[#0d1f3c]/30 text-sm py-4 text-center">Noch keine Ausgaben.</p>
          ) : (
            <div className="space-y-4">
              {topCategories.map((cat) => {
                const catPct = cat.limit > 0 ? Math.min((cat.spent / cat.limit) * 100, 100) : 0;
                return (
                  <div key={cat.category}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-medium text-[#0d1f3c] flex items-center gap-1.5">
                        {CATEGORY_ICONS[cat.category]} {CATEGORY_LABELS[cat.category]}
                      </span>
                      <span className="text-xs text-[#0d1f3c]/50">
                        {formatCurrency(cat.spent, currency)} / {formatCurrency(cat.limit, currency)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${catPct}%`, backgroundColor: CATEGORY_COLORS[cat.category] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Expenses */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-[#0d1f3c]">Letzte Ausgaben</h2>
            <Link href="/dashboard/transactions" className="text-xs text-[#0d1f3c]/40 hover:text-[#0d1f3c] transition-colors">
              Alle →
            </Link>
          </div>
          {recentExpenses.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-2xl mb-2">💸</p>
              <p className="text-[#0d1f3c]/30 text-sm">Noch keine Ausgaben.</p>
              <Link
                href="/dashboard/transactions"
                className="inline-block mt-3 text-xs font-semibold text-[#0d1f3c] border border-[#0d1f3c]/20 px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors"
              >
                Erste Ausgabe hinzufügen
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentExpenses.map((e) => (
                <div key={e.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                      style={{ backgroundColor: `${CATEGORY_COLORS[e.category]}15` }}
                    >
                      {CATEGORY_ICONS[e.category]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0d1f3c] leading-tight">{e.title}</p>
                      <p className="text-xs text-[#0d1f3c]/40">{CATEGORY_LABELS[e.category]}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#0d1f3c]">{formatCurrency(e.amount, e.currency)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        {[
          { href: "/dashboard/transactions", icon: "➕", label: "Ausgabe hinzufügen" },
          { href: "/dashboard/budget", icon: "⚙️", label: "Budget anpassen" },
          { href: "/dashboard/converter", icon: "💱", label: "Währung umrechnen" },
          { href: "/dashboard/settings", icon: "👤", label: "Profil bearbeiten" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-white rounded-2xl p-4 shadow-sm text-center hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="text-2xl mb-2">{link.icon}</div>
            <p className="text-xs font-semibold text-[#0d1f3c]">{link.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

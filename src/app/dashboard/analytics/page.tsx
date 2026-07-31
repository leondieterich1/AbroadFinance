"use client";

import { usePlanner } from "@/hooks/usePlanner";
import { formatCurrency, CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_COLORS } from "@/lib/utils";
import { forecastCurrentMonth, forecastByCategory, monthlyTotals, generateInsights } from "@/lib/analytics";
import BudgetRing from "@/components/ui/BudgetRing";
import DonutChart from "@/components/ui/DonutChart";
import DotPattern from "@/components/ui/DotPattern";

const STATUS_LABEL: Record<string, string> = {
  ok: "Im Plan",
  warning: "Nah am Limit",
  over: "Über Budget",
};

const STATUS_COLOR: Record<string, string> = {
  ok: "text-emerald-600 bg-emerald-50 border-emerald-200",
  warning: "text-amber-600 bg-amber-50 border-amber-200",
  over: "text-rose-600 bg-rose-50 border-rose-200",
};

export default function AnalyticsPage() {
  const planner = usePlanner();
  const currency = planner.budgets[0]?.currency ?? "EUR";
  const totalBudget = planner.totalBudget();

  if (!planner.loaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#0d1f3c]/20 border-t-[#0d1f3c] rounded-full animate-spin" />
      </div>
    );
  }

  const forecast = forecastCurrentMonth(planner.expenses, totalBudget);
  const catForecasts = forecastByCategory(planner.expenses, planner.budgets).filter(
    (c) => c.spent > 0 || c.limit > 0
  );
  const months = monthlyTotals(planner.expenses, 6);
  const insights = generateInsights(planner.expenses, planner.budgets, currency);
  const maxMonth = Math.max(...months.map((m) => m.total), 1);

  const forecastPct = totalBudget > 0 ? (forecast.projectedTotal / totalBudget) * 100 : 0;
  const ringColor = forecastPct >= 100 ? "#f43f5e" : forecastPct >= 90 ? "#fbbf24" : "#34d399";

  const donutData = catForecasts
    .filter((c) => c.spent > 0)
    .map((c) => ({ label: CATEGORY_LABELS[c.category], value: c.spent, color: CATEGORY_COLORS[c.category] }));

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#0d1f3c]">Budget-Analyse</h1>
        <p className="text-[#0d1f3c]/50 mt-1">Trends, Kategorien-Aufteilung und Hochrechnung für diesen Monat.</p>
      </div>

      {/* Forecast */}
      <div className="relative overflow-hidden bg-[#0d1f3c] text-white rounded-2xl p-6 mb-8">
        <DotPattern className="text-white" />
        <div className="relative flex flex-wrap items-center gap-6">
          <div className="relative flex items-center justify-center flex-shrink-0">
            <BudgetRing pct={forecastPct} progressColor={ringColor} size={96} />
            <span className="absolute text-lg font-extrabold">{forecastPct.toFixed(0)}%</span>
          </div>
          <div className="flex flex-wrap gap-x-10 gap-y-3 flex-1">
            <div>
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">Prognose Monatsende</p>
              <p className="text-2xl font-extrabold">{formatCurrency(forecast.projectedTotal, currency)}</p>
            </div>
            <div>
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">Bisher ausgegeben</p>
              <p className="text-2xl font-extrabold">{formatCurrency(forecast.spentSoFar, currency)}</p>
            </div>
            <div>
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">
                {forecast.projectedDelta > 0 ? "Voraussichtliche Überschreitung" : "Voraussichtlich gespart"}
              </p>
              <p className={`text-2xl font-extrabold ${forecast.projectedDelta > 0 ? "text-rose-300" : "text-emerald-300"}`}>
                {formatCurrency(Math.abs(forecast.projectedDelta), currency)}
              </p>
            </div>
          </div>
          <p className="text-white/30 text-xs w-full relative">
            Basierend auf deinem bisherigen Tempo von {formatCurrency(forecast.dailyRate, currency)}/Tag ·
            Tag {forecast.daysElapsed} von {forecast.daysInMonth}
          </p>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-8">
        <h2 className="font-extrabold text-[#0d1f3c] mb-4">Erkenntnisse</h2>
        <ul className="space-y-3">
          {insights.map((text, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-[#0d1f3c]/70">
              <span className="text-base leading-none mt-0.5">💡</span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Monthly trend */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-extrabold text-[#0d1f3c] mb-6">Ausgaben der letzten Monate</h2>
          <div className="flex items-end gap-3" style={{ height: 140 }}>
            {months.map((m, i) => {
              const h = maxMonth > 0 ? (m.total / maxMonth) * 100 : 0;
              const isCurrent = i === months.length - 1;
              return (
                <div key={m.key} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div
                    className={`w-full max-w-9 rounded-t-lg transition-all duration-500 ${isCurrent ? "bg-[#0d1f3c]" : "bg-[#0d1f3c]/20"}`}
                    style={{ height: `${Math.max(h, 2)}%` }}
                    title={formatCurrency(m.total, currency)}
                  />
                  <span className="text-[10px] text-[#0d1f3c]/40 font-semibold">{m.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-extrabold text-[#0d1f3c] mb-6">Kategorien-Aufteilung (dieser Monat)</h2>
          {donutData.length === 0 ? (
            <p className="text-[#0d1f3c]/30 text-sm py-8 text-center">Noch keine Ausgaben diesen Monat.</p>
          ) : (
            <div className="flex items-center gap-6">
              <DonutChart data={donutData} />
              <div className="space-y-2 flex-1 min-w-0">
                {donutData.map((d) => (
                  <div key={d.label} className="flex items-center justify-between gap-2 text-xs">
                    <span className="flex items-center gap-1.5 text-[#0d1f3c]/70 truncate">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                      {d.label}
                    </span>
                    <span className="font-semibold text-[#0d1f3c] flex-shrink-0">{formatCurrency(d.value, currency)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category forecast */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="font-extrabold text-[#0d1f3c] mb-4">Prognose nach Kategorie</h2>
        {catForecasts.length === 0 ? (
          <p className="text-[#0d1f3c]/30 text-sm py-4 text-center">Noch keine Budgets oder Ausgaben erfasst.</p>
        ) : (
          <div className="space-y-4">
            {catForecasts.map((c) => {
              const pct = c.limit > 0 ? Math.min((c.projected / c.limit) * 100, 100) : 0;
              return (
                <div key={c.category}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-[#0d1f3c] flex items-center gap-1.5">
                      {CATEGORY_ICONS[c.category]} {CATEGORY_LABELS[c.category]}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLOR[c.status]}`}>
                      {STATUS_LABEL[c.status]}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: CATEGORY_COLORS[c.category] }}
                    />
                  </div>
                  <p className="text-xs text-[#0d1f3c]/40 mt-1.5">
                    {formatCurrency(c.spent, currency)} bisher · Prognose {formatCurrency(c.projected, currency)} von{" "}
                    {formatCurrency(c.limit, currency)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

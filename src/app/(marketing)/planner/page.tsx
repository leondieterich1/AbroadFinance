"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePlanner } from "@/hooks/usePlanner";
import {
  formatCurrency,
  formatDate,
  CATEGORY_COLORS,
  CURRENCIES,
} from "@/lib/utils";
import { useCategoryLabels } from "@/hooks/useCategoryLabels";
import CategoryIcon from "@/components/ui/CategoryIcon";
import type { ExpenseCategory } from "@/types";
import { Plane, BarChart3, Plus, Settings, Receipt, Check, type LucideIcon } from "lucide-react";

type Tab = "overview" | "budget" | "add";

const CATEGORIES: ExpenseCategory[] = [
  "miete", "essen", "transport", "freizeit", "gesundheit", "sonstiges",
];

export default function PlannerPage() {
  const t = useTranslations("MarketingPlanner");
  const [tab, setTab] = useState<Tab>("overview");
  const planner = usePlanner();

  if (!planner.loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#0d1f3c]/20 border-t-[#0d1f3c] rounded-full animate-spin" />
      </div>
    );
  }

  const totalBudget = planner.totalBudget();
  const totalSpent = planner.totalSpent();
  const totalRemaining = totalBudget - totalSpent;
  const totalPct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
  const currency = planner.budgets[0]?.currency ?? "EUR";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0d1f3c] text-white px-5 md:px-6 py-8 md:py-10">
        <div className="max-w-4xl mx-auto">
          <p className="text-white/50 text-sm font-medium uppercase tracking-widest mb-1 inline-flex items-center gap-1.5"><Plane className="w-3.5 h-3.5" /> {t("brand")}</p>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-5 md:mb-6">{t("title")}</h1>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            <div className="bg-white/10 rounded-xl md:rounded-2xl p-3 md:p-5">
              <p className="text-white/50 text-[10px] md:text-xs font-medium uppercase tracking-wider mb-1">{t("budget")}</p>
              <p className="text-base md:text-2xl font-extrabold">{formatCurrency(totalBudget, currency)}</p>
            </div>
            <div className="bg-white/10 rounded-xl md:rounded-2xl p-3 md:p-5">
              <p className="text-white/50 text-[10px] md:text-xs font-medium uppercase tracking-wider mb-1">{t("expenses")}</p>
              <p className="text-base md:text-2xl font-extrabold text-rose-300">{formatCurrency(totalSpent, currency)}</p>
            </div>
            <div className={`rounded-xl md:rounded-2xl p-3 md:p-5 ${totalRemaining < 0 ? "bg-rose-500/30" : "bg-emerald-500/20"}`}>
              <p className="text-white/50 text-[10px] md:text-xs font-medium uppercase tracking-wider mb-1">{t("remaining")}</p>
              <p className={`text-base md:text-2xl font-extrabold ${totalRemaining < 0 ? "text-rose-300" : "text-emerald-300"}`}>
                {formatCurrency(totalRemaining, currency)}
              </p>
            </div>
          </div>

          {/* Overall progress bar */}
          <div className="mt-5">
            <div className="flex justify-between text-xs text-white/50 mb-2">
              <span>{t("budgetUsed", { pct: totalPct.toFixed(0) })}</span>
              <span>{t("expensesCount", { count: planner.expenses.length })}</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${totalPct >= 100 ? "bg-rose-400" : totalPct >= 80 ? "bg-amber-400" : "bg-emerald-400"}`}
                style={{ width: `${totalPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex">
          {([
            { id: "overview", label: t("tabOverview"), icon: BarChart3 },
            { id: "add", label: t("tabAdd"), icon: Plus },
            { id: "budget", label: t("tabBudget"), icon: Settings },
          ] as { id: Tab; label: string; icon: LucideIcon }[]).map((tabDef) => (
            <button
              key={tabDef.id}
              onClick={() => setTab(tabDef.id)}
              className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors inline-flex items-center gap-1.5 ${
                tab === tabDef.id
                  ? "border-[#0d1f3c] text-[#0d1f3c]"
                  : "border-transparent text-[#0d1f3c]/40 hover:text-[#0d1f3c]/70"
              }`}
            >
              <tabDef.icon className="w-4 h-4" /> {tabDef.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {tab === "overview" && <OverviewTab planner={planner} currency={currency} />}
        {tab === "add" && <AddExpenseTab planner={planner} currency={currency} onAdded={() => setTab("overview")} />}
        {tab === "budget" && <BudgetTab planner={planner} currency={currency} />}
      </div>
    </div>
  );
}

/* ── Overview Tab ─────────────────────────────────────────── */
function OverviewTab({ planner, currency }: { planner: ReturnType<typeof usePlanner>; currency: string }) {
  const t = useTranslations("MarketingPlanner");
  const locale = useLocale();
  const CATEGORY_LABELS = useCategoryLabels();
  return (
    <div className="space-y-8">
      {/* Category progress */}
      <div>
        <h2 className="text-lg font-extrabold text-[#0d1f3c] mb-4">{t("budgetByCategory")}</h2>
        <div className="grid gap-4">
          {planner.budgets.map((b) => {
            const spent = planner.spentFor(b.category);
            const pct = b.limit > 0 ? Math.min((spent / b.limit) * 100, 100) : 0;
            const over = spent > b.limit;
            const color = CATEGORY_COLORS[b.category];
            return (
              <div key={b.category} className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CategoryIcon category={b.category} className="w-5 h-5 text-[#0d1f3c]/70" />
                    <span className="font-semibold text-[#0d1f3c]">{CATEGORY_LABELS[b.category]}</span>
                    {over && (
                      <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-medium">{t("overBudget")}</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`font-bold text-sm ${over ? "text-rose-500" : "text-[#0d1f3c]"}`}>
                      {formatCurrency(spent, currency)}
                    </span>
                    <span className="text-[#0d1f3c]/40 text-sm"> / {formatCurrency(b.limit, currency)}</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: over ? "#f43f5e" : color,
                    }}
                  />
                </div>
                <p className="text-xs text-[#0d1f3c]/40 mt-1.5">
                  {over
                    ? t("overBudgetAmount", { amount: formatCurrency(spent - b.limit, currency) })
                    : t("remainingAmount", { amount: formatCurrency(b.limit - spent, currency) })}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent expenses */}
      <div>
        <h2 className="text-lg font-extrabold text-[#0d1f3c] mb-4">{t("recentExpenses")}</h2>
        {planner.expenses.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <Receipt className="w-9 h-9 mb-3 mx-auto text-orange-300" />
            <p className="text-[#0d1f3c]/50 font-medium">{t("noExpensesTitle")}</p>
            <p className="text-[#0d1f3c]/30 text-sm mt-1">{t("noExpensesHint")}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-50">
            {planner.expenses.slice(0, 20).map((e) => (
              <div key={e.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${CATEGORY_COLORS[e.category]}18` }}
                  >
                    <CategoryIcon category={e.category} className="w-4 h-4" style={{ color: CATEGORY_COLORS[e.category] }} />
                  </div>
                  <div>
                    <p className="font-semibold text-[#0d1f3c] text-sm">{e.title}</p>
                    <p className="text-[#0d1f3c]/40 text-xs">{CATEGORY_LABELS[e.category]} · {formatDate(e.date, locale)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#0d1f3c]">{formatCurrency(e.amount, e.currency)}</span>
                  <button
                    onClick={() => planner.deleteExpense(e.id)}
                    className="opacity-0 group-hover:opacity-100 text-[#0d1f3c]/20 hover:text-rose-500 transition-all text-lg leading-none"
                    title={t("delete")}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Add Expense Tab ──────────────────────────────────────── */
function AddExpenseTab({
  planner, currency, onAdded,
}: {
  planner: ReturnType<typeof usePlanner>;
  currency: string;
  onAdded: () => void;
}) {
  const t = useTranslations("MarketingPlanner");
  const CATEGORY_LABELS = useCategoryLabels();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("essen");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [cur, setCur] = useState(currency);
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !amount || parseFloat(amount) <= 0) return;
    planner.addExpense({
      title: title.trim(),
      amount: parseFloat(amount),
      currency: cur,
      category,
      date,
    });
    setTitle("");
    setAmount("");
    setSuccess(true);
    setTimeout(() => { setSuccess(false); onAdded(); }, 900);
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <h2 className="text-xl font-extrabold text-[#0d1f3c] mb-6">{t("newExpense")}</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-[#0d1f3c] mb-1.5">{t("label")}</label>
            <input
              type="text"
              placeholder={t("labelPlaceholder")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20"
            />
          </div>

          {/* Amount + Currency */}
          <div>
            <label className="block text-sm font-semibold text-[#0d1f3c] mb-1.5">{t("amount")}</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="0,00"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20"
              />
              <select
                value={cur}
                onChange={(e) => setCur(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-3 text-sm text-[#0d1f3c] focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20 bg-white"
              >
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-[#0d1f3c] mb-2">{t("category")}</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    category === cat
                      ? "border-[#0d1f3c] bg-[#0d1f3c] text-white"
                      : "border-gray-200 text-[#0d1f3c]/60 hover:border-[#0d1f3c]/30"
                  }`}
                >
                  <CategoryIcon category={cat} className="w-4 h-4" colored={category !== cat} />
                  <span className="truncate text-xs">{CATEGORY_LABELS[cat].split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-[#0d1f3c] mb-1.5">{t("date")}</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20"
            />
          </div>

          <button
            type="submit"
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
              success
                ? "bg-emerald-500 text-white"
                : "bg-[#0d1f3c] text-white hover:bg-[#162d54]"
            }`}
          >
            {success ? <span className="inline-flex items-center gap-1.5"><Check className="w-4 h-4" /> {t("saved")}</span> : t("saveExpense")}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Budget Tab ───────────────────────────────────────────── */
function BudgetTab({ planner, currency }: { planner: ReturnType<typeof usePlanner>; currency: string }) {
  const t = useTranslations("MarketingPlanner");
  const CATEGORY_LABELS = useCategoryLabels();
  const [cur, setCurLocal] = useState(currency);
  const [saved, setSaved] = useState(false);
  const [values, setValues] = useState<Record<ExpenseCategory, string>>(
    Object.fromEntries(planner.budgets.map((b) => [b.category, String(b.limit)])) as Record<ExpenseCategory, string>
  );

  function handleSave() {
    CATEGORIES.forEach((cat) => {
      const val = parseFloat(values[cat]);
      if (!isNaN(val) && val >= 0) planner.updateBudget(cat, val);
    });
    planner.setCurrency(cur);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const total = CATEGORIES.reduce((sum, cat) => sum + (parseFloat(values[cat]) || 0), 0);

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <h2 className="text-xl font-extrabold text-[#0d1f3c] mb-2">{t("setupBudgetTitle")}</h2>
        <p className="text-[#0d1f3c]/40 text-sm mb-6">{t("setupBudgetDesc")}</p>

        {/* Currency selector */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#0d1f3c] mb-1.5">{t("mainCurrency")}</label>
          <select
            value={cur}
            onChange={(e) => setCurLocal(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20 bg-white"
          >
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Category budgets */}
        <div className="space-y-4 mb-6">
          {CATEGORIES.map((cat) => (
            <div key={cat}>
              <label className="flex items-center gap-2 text-sm font-semibold text-[#0d1f3c] mb-1.5">
                <CategoryIcon category={cat} className="w-4 h-4" />
                <span>{CATEGORY_LABELS[cat]}</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={values[cat]}
                  onChange={(e) => setValues((v) => ({ ...v, [cat]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-16 text-sm text-[#0d1f3c] focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#0d1f3c]/40 font-medium">{cur}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="flex justify-between items-center py-4 border-t border-gray-100 mb-5">
          <span className="font-semibold text-[#0d1f3c]">{t("total")}</span>
          <span className="text-xl font-extrabold text-[#0d1f3c]">{formatCurrency(total, cur)}</span>
        </div>

        <button
          onClick={handleSave}
          className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
            saved ? "bg-emerald-500 text-white" : "bg-[#0d1f3c] text-white hover:bg-[#162d54]"
          }`}
        >
          {saved ? <span className="inline-flex items-center gap-1.5"><Check className="w-4 h-4" /> {t("budgetSaved")}</span> : t("saveBudget")}
        </button>
      </div>
    </div>
  );
}

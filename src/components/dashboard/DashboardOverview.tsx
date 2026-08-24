"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePlanner } from "@/hooks/usePlanner";
import { useCategoryLabels } from "@/hooks/useCategoryLabels";
import { formatCurrency, CATEGORY_COLORS } from "@/lib/utils";
import CategoryIcon from "@/components/ui/CategoryIcon";
import BudgetRing from "@/components/ui/BudgetRing";
import DotPattern from "@/components/ui/DotPattern";
import { ArrowRight, Receipt, Plus, TrendingUp, Settings, Coins, User } from "lucide-react";

export default function DashboardOverview({ userName }: { userName: string }) {
  const t = useTranslations("DashboardOverview");
  const locale = useLocale();
  const CATEGORY_LABELS = useCategoryLabels();

  function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return t("greetingMorning");
    if (h < 18) return t("greetingDay");
    return t("greetingEvening");
  }

  const planner = usePlanner();
  const currency = planner.budgets[0]?.currency ?? "EUR";
  const totalBudget = planner.totalBudget();
  const totalSpent = planner.totalSpent();
  const remaining = totalBudget - totalSpent;
  const pct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  const today = new Date().toLocaleDateString(locale, {
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

  const ringColor = pct >= 100 ? "#f43f5e" : pct >= 80 ? "#fbbf24" : "#34d399";

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[#0d1f3c]/40 text-sm mb-1">{today}</p>
        <h1 className="text-3xl font-extrabold text-[#0d1f3c]">
          {getGreeting()}, {userName.split(" ")[0]} 👋
        </h1>
        <p className="text-[#0d1f3c]/50 mt-1">{t("subtitle")}</p>
      </div>

      {/* Budget overview */}
      <div className="relative overflow-hidden bg-[#0d1f3c] text-white rounded-2xl p-6 mb-8">
        <DotPattern className="text-white" />
        <div className="relative flex flex-wrap items-center gap-6">
          <div className="relative flex items-center justify-center flex-shrink-0">
            <BudgetRing pct={pct} progressColor={ringColor} size={96} />
            <span className="absolute text-xl font-extrabold">{pct.toFixed(0)}%</span>
          </div>
          <div className="flex flex-wrap gap-x-10 gap-y-3">
            <div>
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">{t("totalBudget")}</p>
              <p className="text-2xl font-extrabold">{formatCurrency(totalBudget, currency)}</p>
            </div>
            <div>
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">{t("spent")}</p>
              <p className="text-2xl font-extrabold text-rose-300">{formatCurrency(totalSpent, currency)}</p>
            </div>
            <div>
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">{t("remaining")}</p>
              <p className={`text-2xl font-extrabold ${remaining < 0 ? "text-rose-300" : "text-emerald-300"}`}>
                {formatCurrency(remaining, currency)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top categories */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-[#0d1f3c]">{t("topCategories")}</h2>
            <Link href="/dashboard/budget" className="text-xs text-[#0d1f3c]/40 hover:text-[#0d1f3c] transition-colors">
              <span className="inline-flex items-center gap-0.5">{t("all")} <ArrowRight className="w-3 h-3" /></span>
            </Link>
          </div>
          {topCategories.every((c) => c.spent === 0) ? (
            <p className="text-[#0d1f3c]/30 text-sm py-4 text-center">{t("noExpensesYet")}</p>
          ) : (
            <div className="space-y-4">
              {topCategories.map((cat) => {
                const catPct = cat.limit > 0 ? Math.min((cat.spent / cat.limit) * 100, 100) : 0;
                return (
                  <div key={cat.category}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-medium text-[#0d1f3c] flex items-center gap-1.5">
                        <CategoryIcon category={cat.category} className="w-4 h-4" /> {CATEGORY_LABELS[cat.category]}
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
            <h2 className="font-extrabold text-[#0d1f3c]">{t("recentExpenses")}</h2>
            <Link href="/dashboard/transactions" className="text-xs text-[#0d1f3c]/40 hover:text-[#0d1f3c] transition-colors">
              <span className="inline-flex items-center gap-0.5">{t("all")} <ArrowRight className="w-3 h-3" /></span>
            </Link>
          </div>
          {recentExpenses.length === 0 ? (
            <div className="text-center py-6">
              <Receipt className="w-6 h-6 mx-auto mb-2 text-orange-300" />
              <p className="text-[#0d1f3c]/30 text-sm">{t("noExpensesYet")}</p>
              <Link
                href="/dashboard/transactions"
                className="inline-block mt-3 text-xs font-semibold text-[#0d1f3c] border border-[#0d1f3c]/20 px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors"
              >
                {t("addFirstExpense")}
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentExpenses.map((e) => (
                <div key={e.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${CATEGORY_COLORS[e.category]}15` }}
                    >
                      <CategoryIcon category={e.category} className="w-4 h-4" style={{ color: CATEGORY_COLORS[e.category] }} />
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
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
        {[
          { href: "/dashboard/transactions", icon: Plus, label: t("addExpense"), color: "#f97316" },
          { href: "/dashboard/analytics", icon: TrendingUp, label: t("budgetAnalysis"), color: "#8b5cf6" },
          { href: "/dashboard/budget", icon: Settings, label: t("adjustBudget"), color: "#10b981" },
          { href: "/dashboard/converter", icon: Coins, label: t("convertCurrency"), color: "#f59e0b" },
          { href: "/dashboard/settings", icon: User, label: t("editProfile"), color: "#64748b" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-white rounded-2xl p-4 shadow-sm text-center hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <link.icon className="w-6 h-6 mx-auto mb-2" style={{ color: link.color }} />
            <p className="text-xs font-semibold text-[#0d1f3c]">{link.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

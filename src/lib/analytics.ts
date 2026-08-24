import type { Budget, Expense, ExpenseCategory } from "@/types";
import { formatCurrency } from "@/lib/utils";

export type MonthBucket = { key: string; label: string; total: number };

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string, locale: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(locale, { month: "short", year: "2-digit" });
}

/** Total spend per month for the last `months` months, oldest first, current month last. */
export function monthlyTotals(expenses: Expense[], months = 6, today = new Date(), locale = "de-DE"): MonthBucket[] {
  const buckets: MonthBucket[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = monthKey(d);
    buckets.push({ key, label: monthLabel(key, locale), total: 0 });
  }
  const byKey = new Map(buckets.map((b) => [b.key, b]));
  for (const e of expenses) {
    const bucket = byKey.get(monthKey(new Date(e.date)));
    if (bucket) bucket.total += e.amount;
  }
  return buckets;
}

export type Forecast = {
  daysElapsed: number;
  daysInMonth: number;
  daysRemaining: number;
  spentSoFar: number;
  dailyRate: number;
  projectedTotal: number;
  totalBudget: number;
  projectedDelta: number;
  pctOfMonthElapsed: number;
};

/** Linear projection of end-of-month spend based on the daily rate so far this month. */
export function forecastCurrentMonth(expenses: Expense[], totalBudget: number, today = new Date()): Forecast {
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysElapsed = today.getDate();
  const daysRemaining = daysInMonth - daysElapsed;

  const spentSoFar = expenses
    .filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const dailyRate = daysElapsed > 0 ? spentSoFar / daysElapsed : 0;
  const projectedTotal = dailyRate * daysInMonth;

  return {
    daysElapsed,
    daysInMonth,
    daysRemaining,
    spentSoFar,
    dailyRate,
    projectedTotal,
    totalBudget,
    projectedDelta: projectedTotal - totalBudget,
    pctOfMonthElapsed: (daysElapsed / daysInMonth) * 100,
  };
}

export type CategoryForecast = {
  category: ExpenseCategory;
  spent: number;
  limit: number;
  projected: number;
  status: "ok" | "warning" | "over";
};

/** Same linear projection, broken down per budget category. */
export function forecastByCategory(expenses: Expense[], budgets: Budget[], today = new Date()): CategoryForecast[] {
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysElapsed = today.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return budgets.map((b) => {
    const spent = expenses
      .filter((e) => {
        const d = new Date(e.date);
        return e.category === b.category && d.getFullYear() === year && d.getMonth() === month;
      })
      .reduce((sum, e) => sum + e.amount, 0);
    const dailyRate = daysElapsed > 0 ? spent / daysElapsed : 0;
    const projected = dailyRate * daysInMonth;
    const status: CategoryForecast["status"] =
      b.limit <= 0 ? "ok" : projected > b.limit * 1.05 ? "over" : projected > b.limit * 0.9 ? "warning" : "ok";
    return { category: b.category, spent, limit: b.limit, projected, status };
  });
}

type Translate = (key: string, values?: Record<string, string | number>) => string;

/** Human-readable insights derived from the forecast + recent monthly trend. `t` is an Insights-namespace translator (e.g. from useTranslations("Insights")). */
export function generateInsights(
  expenses: Expense[],
  budgets: Budget[],
  currency: string,
  categoryLabels: Record<ExpenseCategory, string>,
  t: Translate,
  today = new Date(),
  locale = "de-DE"
): string[] {
  const insights: string[] = [];
  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const forecast = forecastCurrentMonth(expenses, totalBudget, today);
  const catForecasts = forecastByCategory(expenses, budgets, today);
  const fmt = (n: number) => formatCurrency(n, currency);

  if (forecast.spentSoFar === 0 || forecast.daysElapsed < 3) {
    return [t("notEnoughData")];
  }

  insights.push(
    forecast.projectedDelta > 0
      ? t("overBudget", { amount: fmt(forecast.projectedDelta) })
      : t("underBudget", { amount: fmt(-forecast.projectedDelta) })
  );

  const overCats = catForecasts
    .filter((c) => c.status === "over")
    .sort((a, b) => b.projected - b.limit - (a.projected - a.limit));
  if (overCats.length > 0) {
    const top = overCats[0];
    insights.push(
      t("categoryOverBudget", { category: categoryLabels[top.category], amount: fmt(top.projected - top.limit) })
    );
  }

  const months = monthlyTotals(expenses, 4, today, locale);
  const prevMonths = months.slice(0, 3).filter((m) => m.total > 0);
  if (prevMonths.length > 0) {
    const avgPrev = prevMonths.reduce((s, m) => s + m.total, 0) / prevMonths.length;
    if (avgPrev > 0) {
      const diffPct = ((forecast.projectedTotal - avgPrev) / avgPrev) * 100;
      if (Math.abs(diffPct) > 15) {
        insights.push(
          diffPct > 0
            ? t("aboveAverage", { pct: diffPct.toFixed(0) })
            : t("belowAverage", { pct: Math.abs(diffPct).toFixed(0) })
        );
      }
    }
  }

  if (forecast.dailyRate > 0) {
    const remaining = totalBudget - forecast.spentSoFar;
    if (remaining > 0) {
      const daysLeft = Math.floor(remaining / forecast.dailyRate);
      if (daysLeft < forecast.daysRemaining) {
        insights.push(t("budgetRunsOut", { days: daysLeft, remaining: forecast.daysRemaining }));
      }
    }
  }

  if (insights.length === 0) {
    insights.push(t("onTrack"));
  }

  return insights;
}

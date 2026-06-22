"use client";

import { useState, useEffect } from "react";
import type { Expense, Budget, ExpenseCategory } from "@/types";

const DEFAULT_BUDGETS: Budget[] = [
  { category: "miete", limit: 800, currency: "EUR" },
  { category: "essen", limit: 300, currency: "EUR" },
  { category: "transport", limit: 100, currency: "EUR" },
  { category: "freizeit", limit: 150, currency: "EUR" },
  { category: "gesundheit", limit: 80, currency: "EUR" },
  { category: "sonstiges", limit: 100, currency: "EUR" },
];

export function usePlanner() {
  const [budgets, setBudgets] = useState<Budget[]>(DEFAULT_BUDGETS);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const b = localStorage.getItem("fa_budgets");
      const e = localStorage.getItem("fa_expenses");
      if (b) setBudgets(JSON.parse(b));
      if (e) setExpenses(JSON.parse(e));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("fa_budgets", JSON.stringify(budgets));
  }, [budgets, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("fa_expenses", JSON.stringify(expenses));
  }, [expenses, loaded]);

  function addExpense(expense: Omit<Expense, "id">) {
    setExpenses((prev) => [
      { ...expense, id: crypto.randomUUID() },
      ...prev,
    ]);
  }

  function deleteExpense(id: string) {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  function updateBudget(category: ExpenseCategory, limit: number) {
    setBudgets((prev) =>
      prev.map((b) => (b.category === category ? { ...b, limit } : b))
    );
  }

  function setCurrency(currency: string) {
    setBudgets((prev) => prev.map((b) => ({ ...b, currency })));
  }

  function spentFor(category: ExpenseCategory): number {
    return expenses
      .filter((e) => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0);
  }

  function totalBudget(): number {
    return budgets.reduce((sum, b) => sum + b.limit, 0);
  }

  function totalSpent(): number {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }

  return {
    budgets,
    expenses,
    loaded,
    addExpense,
    deleteExpense,
    updateBudget,
    setCurrency,
    spentFor,
    totalBudget,
    totalSpent,
  };
}

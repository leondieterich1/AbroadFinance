"use client";

import { useState, useEffect } from "react";
import type { SplitGroup, SplitExpense, SplitMember } from "@/types";

export type Balance = { memberId: string; name: string; balance: number };
export type Settlement = { from: string; fromName: string; to: string; toName: string; amount: number };

export function useSplit() {
  const [groups, setGroups] = useState<SplitGroup[]>([]);
  const [expenses, setExpenses] = useState<SplitExpense[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const g = localStorage.getItem("fa_split_groups");
      const e = localStorage.getItem("fa_split_expenses");
      if (g) setGroups(JSON.parse(g));
      if (e) setExpenses(JSON.parse(e));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("fa_split_groups", JSON.stringify(groups));
  }, [groups, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("fa_split_expenses", JSON.stringify(expenses));
  }, [expenses, loaded]);

  function createGroup(name: string, emoji: string, memberNames: string[], currency: string): SplitGroup {
    const members: SplitMember[] = memberNames.map((n) => ({ id: crypto.randomUUID(), name: n.trim() }));
    const group: SplitGroup = { id: crypto.randomUUID(), name, emoji, members, currency, createdAt: new Date().toISOString() };
    setGroups((prev) => [group, ...prev]);
    return group;
  }

  function deleteGroup(id: string) {
    setGroups((prev) => prev.filter((g) => g.id !== id));
    setExpenses((prev) => prev.filter((e) => e.groupId !== id));
  }

  function addExpense(expense: Omit<SplitExpense, "id">) {
    setExpenses((prev) => [{ ...expense, id: crypto.randomUUID() }, ...prev]);
  }

  function deleteExpense(id: string) {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  function groupExpenses(groupId: string): SplitExpense[] {
    return expenses.filter((e) => e.groupId === groupId);
  }

  function getBalances(group: SplitGroup): Balance[] {
    const exp = groupExpenses(group.id);
    const net: Record<string, number> = {};
    for (const m of group.members) net[m.id] = 0;

    for (const e of exp) {
      net[e.paidBy] = (net[e.paidBy] ?? 0) + e.amount;
      for (const s of e.splits) {
        net[s.memberId] = (net[s.memberId] ?? 0) - s.amount;
      }
    }

    return group.members.map((m) => ({ memberId: m.id, name: m.name, balance: Math.round((net[m.id] ?? 0) * 100) / 100 }));
  }

  function getSettlements(group: SplitGroup): Settlement[] {
    const balances = getBalances(group);
    const creditors = balances.filter((b) => b.balance > 0.01).map((b) => ({ ...b }));
    const debtors = balances.filter((b) => b.balance < -0.01).map((b) => ({ ...b }));
    const settlements: Settlement[] = [];

    creditors.sort((a, b) => b.balance - a.balance);
    debtors.sort((a, b) => a.balance - b.balance);

    let ci = 0, di = 0;
    while (ci < creditors.length && di < debtors.length) {
      const c = creditors[ci];
      const d = debtors[di];
      const amount = Math.min(c.balance, -d.balance);
      if (amount > 0.01) {
        settlements.push({ from: d.memberId, fromName: d.name, to: c.memberId, toName: c.name, amount: Math.round(amount * 100) / 100 });
      }
      c.balance -= amount;
      d.balance += amount;
      if (Math.abs(c.balance) < 0.01) ci++;
      if (Math.abs(d.balance) < 0.01) di++;
    }

    return settlements;
  }

  function totalSpent(groupId: string): number {
    return expenses.filter((e) => e.groupId === groupId).reduce((s, e) => s + e.amount, 0);
  }

  return { groups, expenses, loaded, createGroup, deleteGroup, addExpense, deleteExpense, groupExpenses, getBalances, getSettlements, totalSpent };
}

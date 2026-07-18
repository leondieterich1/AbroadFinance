"use client";

import { useState, useEffect } from "react";
import type { BankAccount, BankTransaction, ExpenseCategory } from "@/types";
import { categorize } from "@/lib/categorize";

export function useAccounts() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const a = localStorage.getItem("fa_bank_accounts");
      const t = localStorage.getItem("fa_bank_transactions");
      if (a) setAccounts(JSON.parse(a));
      if (t) setTransactions(JSON.parse(t));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("fa_bank_accounts", JSON.stringify(accounts));
  }, [accounts, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("fa_bank_transactions", JSON.stringify(transactions));
  }, [transactions, loaded]);

  function addAccount(account: Omit<BankAccount, "id" | "linkedAt">) {
    const newAccount: BankAccount = { ...account, id: crypto.randomUUID(), linkedAt: new Date().toISOString() };
    setAccounts((prev) => [newAccount, ...prev]);
    return newAccount;
  }

  function removeAccount(id: string) {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    setTransactions((prev) => prev.filter((t) => t.accountId !== id));
  }

  function addTransactions(
    accountId: string,
    raw: { date: string; description: string; amount: number }[],
    currency: string
  ) {
    const newTxns: BankTransaction[] = raw
      .filter((r) => r.amount < 0)
      .map((r) => {
        const { category, auto } = categorize(r.description);
        return {
          id: crypto.randomUUID(),
          accountId,
          date: r.date,
          description: r.description,
          amount: Math.abs(r.amount),
          currency,
          category,
          autoCategorized: auto,
          imported: true,
        };
      });
    setTransactions((prev) => [...newTxns, ...prev]);
    return newTxns;
  }

  function updateCategory(id: string, category: ExpenseCategory) {
    setTransactions((prev) => prev.map((t) => t.id === id ? { ...t, category, autoCategorized: false } : t));
  }

  function deleteTransaction(id: string) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  function totalBalance() {
    return accounts.reduce((sum, a) => sum + a.balance, 0);
  }

  function accountTransactions(accountId: string) {
    return transactions.filter((t) => t.accountId === accountId);
  }

  return { accounts, transactions, loaded, addAccount, removeAccount, addTransactions, updateCategory, deleteTransaction, totalBalance, accountTransactions };
}

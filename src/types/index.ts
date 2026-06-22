export type Currency = {
  code: string;
  name: string;
  symbol: string;
};

export type ExpenseCategory =
  | "miete"
  | "essen"
  | "transport"
  | "freizeit"
  | "gesundheit"
  | "sonstiges";

export type Expense = {
  id: string;
  title: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  date: string;
};

export type Budget = {
  category: ExpenseCategory;
  limit: number;
  currency: string;
};

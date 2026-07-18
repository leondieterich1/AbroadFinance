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

export type BankAccount = {
  id: string;
  bankName: string;
  bankColor: string;
  bankInitials: string;
  bankLogo?: string;
  accountType: "girokonto" | "sparkonto" | "kreditkarte" | "wallet";
  holderName: string;
  iban: string;
  balance: number;
  currency: string;
  linkedAt: string;
  isDemo: boolean;
  walletType?: "apple" | "google";
  externalId?: string;
};

export type BankTransaction = {
  id: string;
  accountId: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  autoCategorized: boolean;
  imported: boolean;
};

export type SplitMember = { id: string; name: string };

export type SplitExpense = {
  id: string;
  groupId: string;
  title: string;
  amount: number;
  currency: string;
  paidBy: string;
  splits: { memberId: string; amount: number }[];
  date: string;
};

export type SplitGroup = {
  id: string;
  name: string;
  emoji: string;
  members: SplitMember[];
  currency: string;
  createdAt: string;
};

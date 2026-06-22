export function formatCurrency(amount: number, currency: string, locale = "de-DE"): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
}

export function formatDate(dateString: string, locale = "de-DE"): string {
  return new Date(dateString).toLocaleDateString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export const CATEGORY_LABELS: Record<string, string> = {
  miete: "Miete & Unterkunft",
  essen: "Essen & Trinken",
  transport: "Transport",
  freizeit: "Freizeit",
  gesundheit: "Gesundheit",
  sonstiges: "Sonstiges",
};

export const CATEGORY_ICONS: Record<string, string> = {
  miete: "🏠",
  essen: "🍽️",
  transport: "🚌",
  freizeit: "🎉",
  gesundheit: "💊",
  sonstiges: "📦",
};

export const CATEGORY_COLORS: Record<string, string> = {
  miete: "#0d1f3c",
  essen: "#2563eb",
  transport: "#7c3aed",
  freizeit: "#db2777",
  gesundheit: "#059669",
  sonstiges: "#d97706",
};

export const CURRENCIES = ["EUR", "USD", "GBP", "CHF", "JPY", "AUD", "CAD", "SEK", "NOK", "DKK"];

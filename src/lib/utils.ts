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

"use client";

import { useTranslations } from "next-intl";
import type { ExpenseCategory } from "@/types";

export function useCategoryLabels(): Record<ExpenseCategory, string> {
  const t = useTranslations("Category");
  return {
    miete: t("miete"),
    essen: t("essen"),
    transport: t("transport"),
    freizeit: t("freizeit"),
    gesundheit: t("gesundheit"),
    sonstiges: t("sonstiges"),
  };
}

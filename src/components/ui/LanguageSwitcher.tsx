"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocale } from "@/i18n/actions";
import { LOCALES, type Locale } from "@/i18n/config";

const LABELS: Record<Locale, string> = { de: "DE", en: "EN" };

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleChange(next: Locale) {
    if (next === locale) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <div className={`inline-flex items-center gap-0.5 bg-gray-100 rounded-full p-0.5 ${className}`}>
      {LOCALES.map((l) => (
        <button
          key={l}
          onClick={() => handleChange(l)}
          disabled={pending}
          className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors disabled:opacity-50 ${
            locale === l ? "bg-[#0d1f3c] text-white" : "text-[#0d1f3c]/50 hover:text-[#0d1f3c]"
          }`}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}

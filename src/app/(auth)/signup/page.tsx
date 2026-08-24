"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { MailCheck, ArrowRight } from "lucide-react";

const MIN_SIGNUP_AGE = 16;

function maxBirthDate(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - MIN_SIGNUP_AGE);
  return d.toISOString().slice(0, 10);
}

export default function SignupPage() {
  const t = useTranslations("Signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError(t("errorPasswordLength"));
      return;
    }
    if (!birthDate) {
      setError(t("errorBirthDateRequired"));
      return;
    }
    if (birthDate > maxBirthDate()) {
      setError(t("errorMinAge", { age: MIN_SIGNUP_AGE }));
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/send-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, password, birthDate }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? t("errorGeneric"));
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 w-full max-w-md text-center">
        <MailCheck className="w-10 h-10 mb-5 mx-auto text-emerald-400" />
        <h1 className="text-2xl font-extrabold text-[#0d1f3c] mb-2">{t("sentTitle")}</h1>
        <p className="text-[#0d1f3c]/50 text-sm mb-1">
          {t("sentDesc")}
        </p>
        <p className="font-bold text-[#0d1f3c] mb-6">{email}</p>
        <p className="text-[#0d1f3c]/40 text-xs">
          {t("sentHint")}{" "}
          <button
            onClick={() => setSent(false)}
            className="text-[#0d1f3c] font-semibold hover:underline"
          >
            {t("resend")}
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
      <h1 className="text-2xl font-extrabold text-[#0d1f3c] mb-2">{t("title")}</h1>
      <p className="text-[#0d1f3c]/50 text-sm mb-8">{t("subtitle")}</p>

      {error && (
        <div className="bg-rose-50 text-rose-600 text-sm rounded-xl px-4 py-3 mb-5">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-[#0d1f3c] mb-1.5">{t("name")}</label>
          <input
            type="text"
            placeholder={t("namePlaceholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0d1f3c] mb-1.5">{t("email")}</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0d1f3c] mb-1.5">{t("password")}</label>
          <input
            type="password"
            placeholder={t("passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0d1f3c] mb-1.5">{t("birthDate")}</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            max={maxBirthDate()}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0d1f3c] text-white font-semibold py-3 rounded-xl hover:bg-[#162d54] transition-colors mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t("submitLoading")}
            </>
          ) : (
            <>{t("submit")} <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-[#0d1f3c]/50 mt-6">
        {t("alreadyRegistered")}{" "}
        <Link href="/login" className="text-[#0d1f3c] font-semibold hover:underline">
          {t("loginLink")}
        </Link>
      </p>
    </div>
  );
}

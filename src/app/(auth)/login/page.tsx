"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("Login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError(t("errorInvalid"));
    } else {
      router.push("/dashboard");
    }
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
            placeholder={t("password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0d1f3c] text-white font-semibold py-3 rounded-xl hover:bg-[#162d54] transition-colors mt-2 disabled:opacity-50"
        >
          {loading ? t("submitLoading") : t("submit")}
        </button>
      </form>

      <p className="text-center text-sm text-[#0d1f3c]/50 mt-6">
        {t("noAccount")}{" "}
        <Link href="/signup" className="text-[#0d1f3c] font-semibold hover:underline">
          {t("signupLink")}
        </Link>
      </p>
    </div>
  );
}

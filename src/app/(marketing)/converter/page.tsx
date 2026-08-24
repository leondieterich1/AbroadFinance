"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Plane, AlertTriangle, ArrowLeftRight } from "lucide-react";

const CURRENCIES: Record<string, { symbol: string; flag: string }> = {
  EUR: { symbol: "€", flag: "🇪🇺" },
  USD: { symbol: "$", flag: "🇺🇸" },
  GBP: { symbol: "£", flag: "🇬🇧" },
  CHF: { symbol: "Fr.", flag: "🇨🇭" },
  JPY: { symbol: "¥", flag: "🇯🇵" },
  AUD: { symbol: "A$", flag: "🇦🇺" },
  CAD: { symbol: "C$", flag: "🇨🇦" },
  SEK: { symbol: "kr", flag: "🇸🇪" },
  NOK: { symbol: "kr", flag: "🇳🇴" },
  DKK: { symbol: "kr", flag: "🇩🇰" },
  CNY: { symbol: "¥", flag: "🇨🇳" },
  INR: { symbol: "₹", flag: "🇮🇳" },
  BRL: { symbol: "R$", flag: "🇧🇷" },
  MXN: { symbol: "$", flag: "🇲🇽" },
  SGD: { symbol: "S$", flag: "🇸🇬" },
  HKD: { symbol: "HK$", flag: "🇭🇰" },
  KRW: { symbol: "₩", flag: "🇰🇷" },
  TRY: { symbol: "₺", flag: "🇹🇷" },
  PLN: { symbol: "zł", flag: "🇵🇱" },
  ZAR: { symbol: "R", flag: "🇿🇦" },
};

const POPULAR_PAIRS = [
  ["EUR", "USD"], ["EUR", "GBP"], ["USD", "JPY"],
  ["GBP", "EUR"], ["USD", "CHF"], ["EUR", "CHF"],
];

const QUICK_CURRENCIES = ["USD", "GBP", "CHF", "JPY", "AUD", "CAD", "SEK", "CNY", "INR", "SGD"];

export default function ConverterPage() {
  const t = useTranslations("Converter");
  const tCurrency = useTranslations("CurrencyNames");
  const locale = useLocale();

  function fmt(amount: number, currency: string) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "JPY" || currency === "KRW" ? 0 : 4,
    }).format(amount);
  }

  const [from, setFrom] = useState("EUR");
  const [to, setTo] = useState("USD");
  const [amount, setAmount] = useState("1");
  const [rates, setRates] = useState<Record<string, number>>({});
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchRates = useCallback(async (base: string) => {
    // Check localStorage cache — skip fetch if rates for today already exist
    const cacheKey = `fa_rates_${base}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { date: cachedDate, rates: cachedRates } = JSON.parse(cached);
        const today = new Date().toISOString().slice(0, 10);
        if (cachedDate === today) {
          setRates({ ...cachedRates, [base]: 1 });
          setDate(cachedDate);
          setLoading(false);
          return;
        }
      }
    } catch { /* ignore parse errors */ }

    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/rates?from=${base}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRates({ ...data.rates, [base]: 1 });
      setDate(data.date);
      // Cache for today
      localStorage.setItem(cacheKey, JSON.stringify({ date: data.date, rates: data.rates }));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRates(from); }, [from, fetchRates]);

  function swap() {
    setFrom(to);
    setTo(from);
  }

  const amountNum = parseFloat(amount) || 0;
  const rate = rates[to] ?? 0;
  const converted = amountNum * rate;

  const inverseRate = rate > 0 ? 1 / rate : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0d1f3c] text-white px-6 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3 flex items-center justify-center gap-1.5"><Plane className="w-3.5 h-3.5" /> {t("brand")}</p>
          <h1 className="text-4xl font-extrabold mb-2">{t("title")}</h1>
          <p className="text-white/50 text-sm">
            {t("liveRates")}
            {date && <span className="ml-2 text-white/30">{t("asOf", { date: new Date(date).toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" }) })}</span>}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-6 pb-16 space-y-5">

        {/* Main Converter Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          {error && (
            <div className="bg-rose-50 text-rose-600 text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {t("ratesError")}
            </div>
          )}

          {/* Amount */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-[#0d1f3c]/50 uppercase tracking-wider mb-2">{t("amount")}</label>
            <input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full text-3xl font-extrabold text-[#0d1f3c] border-b-2 border-gray-200 focus:border-[#0d1f3c] outline-none py-2 transition-colors bg-transparent"
              placeholder="0"
            />
          </div>

          {/* From / Swap / To */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 md:gap-3 items-end mb-6">
            <div>
              <label className="block text-xs font-semibold text-[#0d1f3c]/50 uppercase tracking-wider mb-2">{t("from")}</label>
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-[#0d1f3c] focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20 appearance-none cursor-pointer"
              >
                {Object.entries(CURRENCIES).map(([code, c]) => (
                  <option key={code} value={code}>{c.flag} {code} – {tCurrency(code)}</option>
                ))}
              </select>
            </div>

            <button
              onClick={swap}
              className="w-11 h-11 rounded-full bg-[#0d1f3c] text-white flex items-center justify-center hover:bg-[#162d54] transition-colors mb-0.5 flex-shrink-0"
              title={t("swap")}
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>

            <div>
              <label className="block text-xs font-semibold text-[#0d1f3c]/50 uppercase tracking-wider mb-2">{t("to")}</label>
              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-[#0d1f3c] focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20 appearance-none cursor-pointer"
              >
                {Object.entries(CURRENCIES).map(([code, c]) => (
                  <option key={code} value={code}>{c.flag} {code} – {tCurrency(code)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Result */}
          <div className="bg-gray-50 rounded-2xl p-6 text-center">
            {loading ? (
              <div className="flex items-center justify-center gap-3 py-2">
                <div className="w-5 h-5 border-2 border-[#0d1f3c]/20 border-t-[#0d1f3c] rounded-full animate-spin" />
                <span className="text-[#0d1f3c]/40 text-sm">{t("ratesLoading")}</span>
              </div>
            ) : (
              <>
                <div className="flex items-baseline justify-center gap-3 flex-wrap">
                  <span className="text-[#0d1f3c]/50 text-lg font-semibold">{fmt(amountNum, from)}</span>
                  <span className="text-[#0d1f3c]/30">=</span>
                  <span className="text-4xl font-extrabold text-[#0d1f3c]">{fmt(converted, to)}</span>
                </div>
                <div className="mt-3 flex justify-center gap-4 text-xs text-[#0d1f3c]/40">
                  <span>1 {from} = {rate.toFixed(4)} {to}</span>
                  <span>·</span>
                  <span>1 {to} = {inverseRate.toFixed(4)} {from}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quick currency grid */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-sm font-extrabold text-[#0d1f3c] uppercase tracking-wider mb-4">
            {amountNum > 0 ? t("otherCurrencies", { amount: fmt(amountNum, from) }) : t("quickOverview")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {QUICK_CURRENCIES.filter((c) => c !== from).map((code) => {
              const r = rates[code] ?? 0;
              const val = amountNum * r;
              const c = CURRENCIES[code];
              return (
                <button
                  key={code}
                  onClick={() => setTo(code)}
                  className={`rounded-xl p-3 text-left transition-all border ${
                    to === code
                      ? "border-[#0d1f3c] bg-[#0d1f3c] text-white"
                      : "border-gray-100 hover:border-[#0d1f3c]/30 hover:bg-gray-50"
                  }`}
                >
                  <div className="text-lg mb-1">{c?.flag}</div>
                  <div className={`text-xs font-semibold ${to === code ? "text-white/70" : "text-[#0d1f3c]/50"}`}>{code}</div>
                  <div className={`text-sm font-bold truncate ${to === code ? "text-white" : "text-[#0d1f3c]"}`}>
                    {loading ? "…" : fmt(val, code)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Popular pairs */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-sm font-extrabold text-[#0d1f3c] uppercase tracking-wider mb-4">{t("popularPairs")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {POPULAR_PAIRS.map(([pf, pt]) => (
              <button
                key={`${pf}-${pt}`}
                onClick={() => { setFrom(pf); setTo(pt); }}
                className={`flex items-center justify-between rounded-xl px-4 py-3 border text-sm transition-all ${
                  from === pf && to === pt
                    ? "border-[#0d1f3c] bg-[#0d1f3c] text-white"
                    : "border-gray-100 hover:border-[#0d1f3c]/30"
                }`}
              >
                <span className={`font-bold ${from === pf && to === pt ? "text-white" : "text-[#0d1f3c]"}`}>
                  {CURRENCIES[pf]?.flag} {pf} → {CURRENCIES[pt]?.flag} {pt}
                </span>
                {!loading && rates[pt] !== undefined && from === pf && (
                  <span className={`text-xs ${from === pf && to === pt ? "text-white/70" : "text-[#0d1f3c]/40"}`}>
                    {(1 * (rates[pt] ?? 0)).toFixed(4)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <p className="text-center text-xs text-[#0d1f3c]/30 pb-4">
          {t.rich("infoText", { b: (chunks) => <strong>{chunks}</strong> })}
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";

const CURRENCIES: Record<string, { name: string; symbol: string; flag: string }> = {
  EUR: { name: "Euro", symbol: "€", flag: "🇪🇺" },
  USD: { name: "US-Dollar", symbol: "$", flag: "🇺🇸" },
  GBP: { name: "Britisches Pfund", symbol: "£", flag: "🇬🇧" },
  CHF: { name: "Schweizer Franken", symbol: "Fr.", flag: "🇨🇭" },
  JPY: { name: "Japanischer Yen", symbol: "¥", flag: "🇯🇵" },
  AUD: { name: "Australischer Dollar", symbol: "A$", flag: "🇦🇺" },
  CAD: { name: "Kanadischer Dollar", symbol: "C$", flag: "🇨🇦" },
  SEK: { name: "Schwedische Krone", symbol: "kr", flag: "🇸🇪" },
  NOK: { name: "Norwegische Krone", symbol: "kr", flag: "🇳🇴" },
  DKK: { name: "Dänische Krone", symbol: "kr", flag: "🇩🇰" },
  CNY: { name: "Chinesischer Yuan", symbol: "¥", flag: "🇨🇳" },
  INR: { name: "Indische Rupie", symbol: "₹", flag: "🇮🇳" },
  BRL: { name: "Brasilianischer Real", symbol: "R$", flag: "🇧🇷" },
  MXN: { name: "Mexikanischer Peso", symbol: "$", flag: "🇲🇽" },
  SGD: { name: "Singapur-Dollar", symbol: "S$", flag: "🇸🇬" },
  HKD: { name: "Hongkong-Dollar", symbol: "HK$", flag: "🇭🇰" },
  KRW: { name: "Südkoreanischer Won", symbol: "₩", flag: "🇰🇷" },
  TRY: { name: "Türkische Lira", symbol: "₺", flag: "🇹🇷" },
  PLN: { name: "Polnischer Zloty", symbol: "zł", flag: "🇵🇱" },
  ZAR: { name: "Südafrikanischer Rand", symbol: "R", flag: "🇿🇦" },
};

const POPULAR_PAIRS = [
  ["EUR", "USD"], ["EUR", "GBP"], ["USD", "JPY"],
  ["GBP", "EUR"], ["USD", "CHF"], ["EUR", "CHF"],
];

const QUICK_CURRENCIES = ["USD", "GBP", "CHF", "JPY", "AUD", "CAD", "SEK", "CNY", "INR", "SGD"];

function fmt(amount: number, currency: string) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "JPY" || currency === "KRW" ? 0 : 4,
  }).format(amount);
}

export default function ConverterPage() {
  const [from, setFrom] = useState("EUR");
  const [to, setTo] = useState("USD");
  const [amount, setAmount] = useState("1");
  const [rates, setRates] = useState<Record<string, number>>({});
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchRates = useCallback(async (base: string) => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/rates?from=${base}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRates({ ...data.rates, [base]: 1 });
      setDate(data.date);
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
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">✈️ FinanceAbroad</p>
          <h1 className="text-4xl font-extrabold mb-2">Währungsrechner</h1>
          <p className="text-white/50 text-sm">
            Live-Wechselkurse · täglich aktualisiert
            {date && <span className="ml-2 text-white/30">· Stand: {new Date(date).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })}</span>}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-6 pb-16 space-y-5">

        {/* Main Converter Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          {error && (
            <div className="bg-rose-50 text-rose-600 text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
              ⚠️ Kurse konnten nicht geladen werden. Bitte Seite neu laden.
            </div>
          )}

          {/* Amount */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-[#0d1f3c]/50 uppercase tracking-wider mb-2">Betrag</label>
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
          <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end mb-6">
            <div>
              <label className="block text-xs font-semibold text-[#0d1f3c]/50 uppercase tracking-wider mb-2">Von</label>
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-[#0d1f3c] focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20 appearance-none cursor-pointer"
              >
                {Object.entries(CURRENCIES).map(([code, c]) => (
                  <option key={code} value={code}>{c.flag} {code} – {c.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={swap}
              className="w-11 h-11 rounded-full bg-[#0d1f3c] text-white flex items-center justify-center hover:bg-[#162d54] transition-colors text-lg mb-0.5 flex-shrink-0"
              title="Tauschen"
            >
              ⇄
            </button>

            <div>
              <label className="block text-xs font-semibold text-[#0d1f3c]/50 uppercase tracking-wider mb-2">Nach</label>
              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-[#0d1f3c] focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20 appearance-none cursor-pointer"
              >
                {Object.entries(CURRENCIES).map(([code, c]) => (
                  <option key={code} value={code}>{c.flag} {code} – {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Result */}
          <div className="bg-gray-50 rounded-2xl p-6 text-center">
            {loading ? (
              <div className="flex items-center justify-center gap-3 py-2">
                <div className="w-5 h-5 border-2 border-[#0d1f3c]/20 border-t-[#0d1f3c] rounded-full animate-spin" />
                <span className="text-[#0d1f3c]/40 text-sm">Kurse werden geladen…</span>
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
            {amountNum > 0 ? `${fmt(amountNum, from)} in anderen Währungen` : "Schnellübersicht"}
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
          <h2 className="text-sm font-extrabold text-[#0d1f3c] uppercase tracking-wider mb-4">Beliebte Paare</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {POPULAR_PAIRS.map(([f, t]) => (
              <button
                key={`${f}-${t}`}
                onClick={() => { setFrom(f); setTo(t); }}
                className={`flex items-center justify-between rounded-xl px-4 py-3 border text-sm transition-all ${
                  from === f && to === t
                    ? "border-[#0d1f3c] bg-[#0d1f3c] text-white"
                    : "border-gray-100 hover:border-[#0d1f3c]/30"
                }`}
              >
                <span className={`font-bold ${from === f && to === t ? "text-white" : "text-[#0d1f3c]"}`}>
                  {CURRENCIES[f]?.flag} {f} → {CURRENCIES[t]?.flag} {t}
                </span>
                {!loading && rates[t] !== undefined && from === f && (
                  <span className={`text-xs ${from === f && to === t ? "text-white/70" : "text-[#0d1f3c]/40"}`}>
                    {(1 * (rates[t] ?? 0)).toFixed(4)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <p className="text-center text-xs text-[#0d1f3c]/30 pb-4">
          Kurse von <strong>Frankfurter</strong> (Europäische Zentralbank) · stündlich aktualisiert · nur zur Information
        </p>
      </div>
    </div>
  );
}

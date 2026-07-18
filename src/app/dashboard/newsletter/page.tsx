"use client";

import { useState, useEffect } from "react";

type ExchangeRate = { code: string; rate: number; change: number };
type Article = { title: string; summary: string; link: string; source: { name: string; url: string; hint: string } };
type Tip = { title: string; text: string; source: { name: string; url: string } };

type Newsletter = {
  date: string;
  rateDate: string;
  exchangeRates: ExchangeRate[];
  articles: Article[];
  tip: Tip;
};

const CURRENCY_FLAGS: Record<string, string> = {
  USD: "🇺🇸", GBP: "🇬🇧", CHF: "🇨🇭", JPY: "🇯🇵", SEK: "🇸🇪", PLN: "🇵🇱",
  AUD: "🇦🇺", CAD: "🇨🇦", NOK: "🇳🇴", DKK: "🇩🇰", CNY: "🇨🇳", INR: "🇮🇳",
};

const CACHE_KEY = "fa_newsletter_cache_v2";

function fmt(rate: number, code: string) {
  const decimals = code === "JPY" ? 2 : 4;
  return rate.toFixed(decimals);
}

export default function NewsletterPage() {
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function load(force = false) {
    if (!force) {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { fetched, data } = JSON.parse(cached);
          const now = Date.now();
          if (now - fetched < 3600 * 1000) {
            setNewsletter(data);
            setLoading(false);
            return;
          }
        }
      } catch { /* ignore */ }
    }
    if (force) setRefreshing(true);
    setError(false);
    try {
      const res = await fetch("/api/newsletter");
      if (!res.ok) throw new Error();
      const data: Newsletter = await res.json();
      setNewsletter(data);
      localStorage.setItem(CACHE_KEY, JSON.stringify({ fetched: Date.now(), data }));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#0d1f3c]/30 uppercase tracking-widest">Täglich aktuell</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#0d1f3c]">FinanceAbroad Daily</h1>
          <p className="text-[#0d1f3c]/40 text-sm mt-0.5">
            Echtzeit-Kurse · ARD Tagesschau · {newsletter?.date ?? "wird geladen…"}
          </p>
        </div>
        <button onClick={() => load(true)} disabled={refreshing || loading}
          className="flex items-center gap-2 border border-gray-200 bg-white text-[#0d1f3c]/60 hover:text-[#0d1f3c] text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-40 flex-shrink-0">
          <span className={refreshing ? "animate-spin inline-block" : ""}>↻</span>
          {refreshing ? "Laden…" : "Aktualisieren"}
        </button>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4">
          <div className="bg-[#0d1f3c] rounded-2xl p-6 animate-pulse h-32" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-full mb-2" />
              <div className="h-3 bg-gray-100 rounded w-5/6" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-8 text-center">
          <p className="text-3xl mb-3">⚠️</p>
          <p className="font-extrabold text-[#0d1f3c] mb-2">Newsletter konnte nicht geladen werden</p>
          <p className="text-[#0d1f3c]/40 text-sm mb-4">Bitte prüfe deine Internetverbindung.</p>
          <button onClick={() => load(true)} className="bg-[#0d1f3c] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#162d54] transition-colors">
            Erneut versuchen
          </button>
        </div>
      )}

      {/* Content */}
      {newsletter && !loading && (
        <div className="space-y-4">

          {/* Exchange rates */}
          <div className="bg-[#0d1f3c] text-white rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-0.5">Wechselkurse</p>
                <p className="text-white font-extrabold">1 EUR = …</p>
              </div>
              <div className="text-right">
                <p className="text-white/30 text-xs">EZB-Kurs</p>
                <p className="text-white/50 text-xs">{newsletter.rateDate}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {newsletter.exchangeRates.map((r) => (
                <div key={r.code} className="bg-white/10 rounded-xl px-3 py-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{CURRENCY_FLAGS[r.code] ?? "🏳️"}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      r.change > 0 ? "bg-emerald-500/20 text-emerald-300" :
                      r.change < 0 ? "bg-rose-500/20 text-rose-300" :
                      "bg-white/10 text-white/40"
                    }`}>
                      {r.change > 0 ? "+" : ""}{r.change}%
                    </span>
                  </div>
                  <p className="text-white/50 text-xs font-semibold">{r.code}</p>
                  <p className="text-white font-extrabold text-sm">{fmt(r.rate, r.code)}</p>
                </div>
              ))}
            </div>
            <p className="text-white/20 text-[10px] mt-3 text-center">
              Quelle: Europäische Zentralbank · ecb.europa.eu · Nur zur Information
            </p>
          </div>

          {/* News articles */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-[#0d1f3c]">Wirtschaftsnachrichten</h2>
                <p className="text-xs text-[#0d1f3c]/30 mt-0.5">ARD Tagesschau · Öffentlich-rechtlich</p>
              </div>
              <a href="https://www.tagesschau.de/wirtschaft" target="_blank" rel="noopener noreferrer"
                className="text-xs text-[#0d1f3c]/40 hover:text-[#0d1f3c] transition-colors font-semibold">
                Alle Nachrichten →
              </a>
            </div>
            <div className="divide-y divide-gray-50">
              {newsletter.articles.map((article, i) => (
                <a key={i} href={article.link} target="_blank" rel="noopener noreferrer"
                  className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors group block">
                  <div className="w-8 h-8 rounded-xl bg-[#0d1f3c]/5 flex items-center justify-center text-base flex-shrink-0 mt-0.5">
                    📰
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#0d1f3c] leading-snug group-hover:text-[#162d54] transition-colors mb-1">
                      {article.title}
                    </p>
                    {article.summary && (
                      <p className="text-xs text-[#0d1f3c]/40 leading-relaxed line-clamp-2">{article.summary}</p>
                    )}
                    <p className="text-[10px] text-[#0d1f3c]/25 mt-1.5 font-semibold uppercase tracking-wider">
                      {article.source.name} · {article.source.hint}
                    </p>
                  </div>
                  <span className="text-gray-300 group-hover:text-gray-400 transition-colors text-lg flex-shrink-0">→</span>
                </a>
              ))}
            </div>
          </div>

          {/* Tip of the day */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
            <p className="text-emerald-600 text-xs font-bold uppercase tracking-widest mb-2">💡 Tipp des Tages</p>
            <h3 className="font-extrabold text-[#0d1f3c] mb-2">{newsletter.tip.title}</h3>
            <p className="text-[#0d1f3c]/60 text-sm leading-relaxed mb-3">{newsletter.tip.text}</p>
            <a href={newsletter.tip.source.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
              <span>🔗</span>
              <span className="underline underline-offset-2">{newsletter.tip.source.name}</span>
            </a>
          </div>

          {/* Legal disclaimer */}
          <div className="bg-gray-50 rounded-2xl p-4 text-center">
            <p className="text-xs text-[#0d1f3c]/30 leading-relaxed">
              Wechselkurse von der <strong>Europäischen Zentralbank</strong> (ecb.europa.eu) · Nachrichten von <strong>ARD Tagesschau</strong> (tagesschau.de) ·
              Alle Angaben ohne Gewähr · Keine Anlageberatung
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

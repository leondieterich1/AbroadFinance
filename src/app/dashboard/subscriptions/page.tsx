"use client";

import { useState, useEffect } from "react";

type Cycle = "monthly" | "yearly" | "weekly";

type Subscription = {
  id: string;
  name: string;
  amount: number;
  currency: string;
  cycle: Cycle;
  category: string;
  color: string;
  nextDate: string;
  logo?: string;
};

const CATEGORIES = ["Streaming", "Musik", "Software", "Fitness", "News", "Gaming", "Cloud", "Sonstiges"];
const CATEGORY_ICONS: Record<string, string> = {
  Streaming: "📺", Musik: "🎵", Software: "💻", Fitness: "💪",
  News: "📰", Gaming: "🎮", Cloud: "☁️", Sonstiges: "📦",
};
const COLORS = ["#0d1f3c", "#E50914", "#1DB954", "#0078d4", "#FF6B35", "#9333ea", "#0891b2", "#f59e0b"];
const CURRENCIES = ["EUR", "USD", "GBP", "CHF"];

const POPULAR: Partial<Subscription>[] = [
  { name: "Netflix", color: "#E50914", category: "Streaming", amount: 12.99, currency: "EUR", cycle: "monthly", logo: "https://logo.clearbit.com/netflix.com" },
  { name: "Spotify", color: "#1DB954", category: "Musik", amount: 9.99, currency: "EUR", cycle: "monthly", logo: "https://logo.clearbit.com/spotify.com" },
  { name: "Disney+", color: "#0078d4", category: "Streaming", amount: 8.99, currency: "EUR", cycle: "monthly", logo: "https://logo.clearbit.com/disneyplus.com" },
  { name: "Apple One", color: "#555", category: "Software", amount: 18.95, currency: "EUR", cycle: "monthly", logo: "https://logo.clearbit.com/apple.com" },
  { name: "YouTube Premium", color: "#FF0000", category: "Streaming", amount: 11.99, currency: "EUR", cycle: "monthly", logo: "https://logo.clearbit.com/youtube.com" },
  { name: "Amazon Prime", color: "#FF9900", category: "Streaming", amount: 8.99, currency: "EUR", cycle: "monthly", logo: "https://logo.clearbit.com/amazon.de" },
];

function fmt(n: number, cur = "EUR") {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: cur, minimumFractionDigits: 2 }).format(n);
}

function toMonthly(amount: number, cycle: Cycle): number {
  if (cycle === "yearly") return amount / 12;
  if (cycle === "weekly") return amount * 4.33;
  return amount;
}

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [modal, setModal] = useState<"none" | "create">("none");

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [cycle, setCycle] = useState<Cycle>("monthly");
  const [category, setCategory] = useState("Streaming");
  const [color, setColor] = useState("#0d1f3c");
  const [nextDate, setNextDate] = useState(new Date().toISOString().slice(0, 10));
  const [logo, setLogo] = useState("");

  useEffect(() => {
    try { const s = localStorage.getItem("fa_subscriptions"); if (s) setSubs(JSON.parse(s)); } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("fa_subscriptions", JSON.stringify(subs));
  }, [subs, loaded]);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !amount || parseFloat(amount) <= 0) return;
    const sub: Subscription = {
      id: crypto.randomUUID(), name: name.trim(), logo: logo || undefined,
      amount: parseFloat(amount.replace(",", ".")), currency, cycle, category, color, nextDate,
    };
    setSubs((p) => [...p, sub]);
    resetForm(); setModal("none");
  }

  function addPopular(preset: Partial<Subscription>) {
    const sub: Subscription = {
      id: crypto.randomUUID(),
      name: preset.name!, color: preset.color!, category: preset.category!,
      amount: preset.amount!, currency: preset.currency!, cycle: preset.cycle!,
      logo: preset.logo, nextDate: new Date().toISOString().slice(0, 10),
    };
    setSubs((p) => [...p, sub]);
  }

  function resetForm() {
    setName(""); setAmount(""); setCycle("monthly"); setCategory("Streaming");
    setColor("#0d1f3c"); setNextDate(new Date().toISOString().slice(0, 10)); setLogo("");
  }

  const monthlyTotal = subs.reduce((s, sub) => s + toMonthly(sub.amount, sub.cycle), 0);
  const yearlyTotal = monthlyTotal * 12;

  const byCategory = CATEGORIES.map((cat) => ({
    cat,
    subs: subs.filter((s) => s.category === cat),
    total: subs.filter((s) => s.category === cat).reduce((s, sub) => s + toMonthly(sub.amount, sub.cycle), 0),
  })).filter((g) => g.subs.length > 0);

  const upcoming = [...subs].sort((a, b) => a.nextDate.localeCompare(b.nextDate)).slice(0, 3);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">

      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0d1f3c]">Abo-Tracker</h1>
          <p className="text-[#0d1f3c]/40 text-sm mt-0.5">{subs.length} Abonnement{subs.length !== 1 ? "s" : ""} · {fmt(monthlyTotal)}/Monat</p>
        </div>
        <button onClick={() => setModal("create")} className="bg-[#0d1f3c] text-white font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-[#162d54] transition-colors flex-shrink-0">
          + Abo hinzufügen
        </button>
      </div>

      {/* Cost summary */}
      {subs.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-[#0d1f3c] text-white rounded-2xl p-5">
            <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">Pro Monat</p>
            <p className="text-3xl font-extrabold">{fmt(monthlyTotal)}</p>
            <p className="text-white/30 text-xs mt-1">{subs.length} aktive Abos</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <p className="text-[#0d1f3c]/40 text-xs font-semibold uppercase tracking-widest mb-1">Pro Jahr</p>
            <p className="text-3xl font-extrabold text-[#0d1f3c]">{fmt(yearlyTotal)}</p>
            <p className="text-[#0d1f3c]/30 text-xs mt-1">Hochgerechnet</p>
          </div>
        </div>
      )}

      {subs.length === 0 ? (
        <div>
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center mb-6">
            <p className="text-5xl mb-4">📦</p>
            <h3 className="font-extrabold text-[#0d1f3c] text-lg mb-2">Noch keine Abos</h3>
            <p className="text-[#0d1f3c]/40 text-sm mb-6">Füge deine Abonnements hinzu und sieh wie viel du monatlich ausgibst.</p>
          </div>
          <div>
            <p className="text-xs font-bold text-[#0d1f3c]/40 uppercase tracking-widest mb-3">Schnell hinzufügen</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {POPULAR.map((p) => (
                <button key={p.name} onClick={() => addPopular(p)}
                  className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-[#0d1f3c]/20 hover:bg-gray-50 transition-colors text-left">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.logo} alt={p.name} className="w-8 h-8 rounded-lg object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                  <div>
                    <p className="text-sm font-bold text-[#0d1f3c]">{p.name}</p>
                    <p className="text-xs text-[#0d1f3c]/40">{fmt(p.amount!, p.currency!)}/Monat</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-[1fr_260px] gap-6">
          <div className="space-y-4">
            {/* Popular quick-add */}
            <div>
              <p className="text-xs font-bold text-[#0d1f3c]/40 uppercase tracking-widest mb-3">Schnell hinzufügen</p>
              <div className="flex gap-2 flex-wrap">
                {POPULAR.filter((p) => !subs.some((s) => s.name === p.name)).map((p) => (
                  <button key={p.name} onClick={() => addPopular(p)}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-100 rounded-xl hover:border-[#0d1f3c]/20 transition-colors text-sm font-semibold text-[#0d1f3c]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.logo} alt={p.name} className="w-5 h-5 rounded object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Subs list */}
            {byCategory.map(({ cat, subs: catSubs, total }) => (
              <div key={cat} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50">
                  <span className="text-sm font-extrabold text-[#0d1f3c]">{CATEGORY_ICONS[cat]} {cat}</span>
                  <span className="text-xs font-bold text-[#0d1f3c]/40">{fmt(total)}/Mo</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {catSubs.map((sub) => (
                    <div key={sub.id} className="flex items-center gap-3 px-5 py-3.5 group">
                      <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
                        style={{ background: `${sub.color}18` }}>
                        {sub.logo
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={sub.logo} alt={sub.name} className="w-7 h-7 object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                          : <span className="text-xs font-extrabold" style={{ color: sub.color }}>{sub.name.slice(0, 2).toUpperCase()}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#0d1f3c]">{sub.name}</p>
                        <p className="text-xs text-[#0d1f3c]/40">
                          {sub.cycle === "monthly" ? "Monatlich" : sub.cycle === "yearly" ? "Jährlich" : "Wöchentlich"}
                          {sub.nextDate && ` · nächste Zahlung ${new Date(sub.nextDate).toLocaleDateString("de-DE", { day: "2-digit", month: "short" })}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#0d1f3c]">{fmt(sub.amount, sub.currency)}</p>
                        <p className="text-xs text-[#0d1f3c]/30">{fmt(toMonthly(sub.amount, sub.cycle))}/Mo</p>
                      </div>
                      <button onClick={() => setSubs((p) => p.filter((s) => s.id !== sub.id))}
                        className="opacity-0 group-hover:opacity-100 text-gray-200 hover:text-rose-400 transition-all text-xl ml-1">×</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {upcoming.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-extrabold text-[#0d1f3c] mb-3">Nächste Zahlungen</h3>
                <div className="space-y-2.5">
                  {upcoming.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: sub.color }} />
                        <span className="text-sm text-[#0d1f3c]">{sub.name}</span>
                      </div>
                      <span className="text-xs font-bold text-[#0d1f3c]">{fmt(sub.amount, sub.currency)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <p className="text-amber-700 text-xs font-bold mb-1">💡 Wusstest du?</p>
              <p className="text-amber-700 text-sm">Im Durchschnitt vergessen Menschen 2–3 aktive Abos. Das sind bis zu {fmt(monthlyTotal * 0.2)}/Monat die man einsparen könnte.</p>
            </div>
          </div>
        </div>
      )}

      {/* Create modal */}
      {modal === "create" && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) { setModal("none"); resetForm(); } }}>
          <div className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
              <h2 className="font-extrabold text-[#0d1f3c] text-lg">Abo hinzufügen</h2>
              <button onClick={() => { setModal("none"); resetForm(); }} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <form onSubmit={handleAdd} className="overflow-y-auto flex-1 p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0d1f3c]/50 uppercase tracking-widest mb-2">Name</label>
                <input autoFocus type="text" placeholder="z. B. Spotify" value={name} onChange={(e) => setName(e.target.value)} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-[#0d1f3c]/50 uppercase tracking-widest mb-2">Betrag</label>
                  <input type="text" inputMode="decimal" placeholder="9,99" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ""))} required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20" />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-bold text-[#0d1f3c]/50 uppercase tracking-widest mb-2">Währung</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-[#0d1f3c] bg-white focus:outline-none">
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0d1f3c]/50 uppercase tracking-widest mb-2">Zyklus</label>
                <div className="flex gap-2">
                  {(["weekly", "monthly", "yearly"] as Cycle[]).map((c) => (
                    <button key={c} type="button" onClick={() => setCycle(c)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${cycle === c ? "bg-[#0d1f3c] text-white" : "bg-gray-50 text-[#0d1f3c]/60 hover:bg-gray-100"}`}>
                      {c === "weekly" ? "Wöchentlich" : c === "monthly" ? "Monatlich" : "Jährlich"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0d1f3c]/50 uppercase tracking-widest mb-2">Kategorie</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button key={cat} type="button" onClick={() => setCategory(cat)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${category === cat ? "bg-[#0d1f3c] text-white" : "bg-gray-50 text-[#0d1f3c]/60 hover:bg-gray-100"}`}>
                      {CATEGORY_ICONS[cat]} {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0d1f3c]/50 uppercase tracking-widest mb-2">Nächste Zahlung</label>
                <input type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0d1f3c]/50 uppercase tracking-widest mb-2">Farbe</label>
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full transition-all ${color === c ? "scale-125 ring-2 ring-offset-2 ring-gray-400" : ""}`}
                      style={{ background: c }} />
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full bg-[#0d1f3c] text-white rounded-xl py-3.5 font-bold text-sm hover:bg-[#162d54] transition-colors">
                Abo speichern →
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

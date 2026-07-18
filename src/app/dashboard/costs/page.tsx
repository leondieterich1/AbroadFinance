"use client";

import { useState } from "react";

type City = {
  id: string;
  name: string;
  country: string;
  flag: string;
  currency: string;
  costs: {
    rent1room: number;
    rent_shared: number;
    groceries: number;
    transport: number;
    eating_out: number;
    coffee: number;
    gym: number;
    internet: number;
    utilities: number;
  };
};

const CITIES: City[] = [
  { id: "berlin", name: "Berlin", country: "Deutschland", flag: "🇩🇪", currency: "EUR",
    costs: { rent1room: 1100, rent_shared: 650, groceries: 250, transport: 86, eating_out: 12, coffee: 3.50, gym: 30, internet: 30, utilities: 150 } },
  { id: "munich", name: "München", country: "Deutschland", flag: "🇩🇪", currency: "EUR",
    costs: { rent1room: 1500, rent_shared: 900, groceries: 280, transport: 57, eating_out: 15, coffee: 4.00, gym: 40, internet: 30, utilities: 160 } },
  { id: "hamburg", name: "Hamburg", country: "Deutschland", flag: "🇩🇪", currency: "EUR",
    costs: { rent1room: 1200, rent_shared: 700, groceries: 260, transport: 107, eating_out: 13, coffee: 3.80, gym: 35, internet: 30, utilities: 155 } },
  { id: "london", name: "London", country: "Großbritannien", flag: "🇬🇧", currency: "GBP",
    costs: { rent1room: 1800, rent_shared: 1000, groceries: 300, transport: 180, eating_out: 15, coffee: 4.50, gym: 50, internet: 40, utilities: 200 } },
  { id: "amsterdam", name: "Amsterdam", country: "Niederlande", flag: "🇳🇱", currency: "EUR",
    costs: { rent1room: 1500, rent_shared: 900, groceries: 270, transport: 100, eating_out: 14, coffee: 4.00, gym: 35, internet: 35, utilities: 170 } },
  { id: "paris", name: "Paris", country: "Frankreich", flag: "🇫🇷", currency: "EUR",
    costs: { rent1room: 1400, rent_shared: 800, groceries: 290, transport: 86, eating_out: 14, coffee: 3.50, gym: 40, internet: 30, utilities: 160 } },
  { id: "barcelona", name: "Barcelona", country: "Spanien", flag: "🇪🇸", currency: "EUR",
    costs: { rent1room: 1000, rent_shared: 600, groceries: 220, transport: 40, eating_out: 11, coffee: 2.00, gym: 25, internet: 30, utilities: 110 } },
  { id: "vienna", name: "Wien", country: "Österreich", flag: "🇦🇹", currency: "EUR",
    costs: { rent1room: 1100, rent_shared: 650, groceries: 250, transport: 51, eating_out: 12, coffee: 3.80, gym: 30, internet: 28, utilities: 140 } },
  { id: "zurich", name: "Zürich", country: "Schweiz", flag: "🇨🇭", currency: "CHF",
    costs: { rent1room: 2200, rent_shared: 1400, groceries: 500, transport: 100, eating_out: 25, coffee: 5.50, gym: 90, internet: 60, utilities: 250 } },
  { id: "stockholm", name: "Stockholm", country: "Schweden", flag: "🇸🇪", currency: "SEK",
    costs: { rent1room: 14000, rent_shared: 8000, groceries: 3500, transport: 970, eating_out: 150, coffee: 50, gym: 400, internet: 300, utilities: 1800 } },
  { id: "lisbon", name: "Lissabon", country: "Portugal", flag: "🇵🇹", currency: "EUR",
    costs: { rent1room: 1100, rent_shared: 650, groceries: 200, transport: 40, eating_out: 9, coffee: 1.20, gym: 25, internet: 25, utilities: 100 } },
  { id: "prague", name: "Prag", country: "Tschechien", flag: "🇨🇿", currency: "CZK",
    costs: { rent1room: 22000, rent_shared: 13000, groceries: 6000, transport: 670, eating_out: 200, coffee: 60, gym: 700, internet: 500, utilities: 3500 } },
  { id: "warsaw", name: "Warschau", country: "Polen", flag: "🇵🇱", currency: "PLN",
    costs: { rent1room: 3500, rent_shared: 2000, groceries: 1200, transport: 110, eating_out: 35, coffee: 12, gym: 120, internet: 60, utilities: 700 } },
  { id: "dubai", name: "Dubai", country: "VAE", flag: "🇦🇪", currency: "AED",
    costs: { rent1room: 5000, rent_shared: 2800, groceries: 1000, transport: 400, eating_out: 50, coffee: 20, gym: 300, internet: 350, utilities: 600 } },
  { id: "singapore", name: "Singapur", country: "Singapur", flag: "🇸🇬", currency: "SGD",
    costs: { rent1room: 2800, rent_shared: 1500, groceries: 600, transport: 120, eating_out: 8, coffee: 6, gym: 80, internet: 30, utilities: 150 } },
];

const COST_LABELS: Record<string, string> = {
  rent1room: "Eigene 1-Zi.-Wohnung",
  rent_shared: "WG-Zimmer",
  groceries: "Lebensmittel",
  transport: "ÖPNV Monatsticket",
  eating_out: "Mittagessen (Restaurant)",
  coffee: "Kaffee (Café)",
  gym: "Fitnessstudio",
  internet: "Internet",
  utilities: "Nebenkosten",
};

const COST_ICONS: Record<string, string> = {
  rent1room: "🏠", rent_shared: "🤝", groceries: "🛒", transport: "🚇",
  eating_out: "🍽️", coffee: "☕", gym: "💪", internet: "📶", utilities: "💡",
};

function fmt(n: number, cur: string) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: cur, maximumFractionDigits: 2 }).format(n);
}

function monthlyTotal(city: City) {
  const c = city.costs;
  return c.rent_shared + c.groceries + c.transport + (c.eating_out * 20) + (c.coffee * 20) + c.gym + c.internet + c.utilities;
}

export default function CostsPage() {
  const [selected, setSelected] = useState<string[]>(["berlin", "london"]);
  const [rentMode, setRentMode] = useState<"rent1room" | "rent_shared">("rent_shared");
  const [search, setSearch] = useState("");

  const selectedCities = selected.map((id) => CITIES.find((c) => c.id === id)!).filter(Boolean);
  const filtered = CITIES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.country.toLowerCase().includes(search.toLowerCase())
  );

  function toggleCity(id: string) {
    if (selected.includes(id)) {
      if (selected.length <= 1) return;
      setSelected((p) => p.filter((s) => s !== id));
    } else {
      if (selected.length >= 3) setSelected((p) => [...p.slice(1), id]);
      else setSelected((p) => [...p, id]);
    }
  }

  const costKeys = (Object.keys(COST_LABELS) as (keyof City["costs"])[]).filter(
    (k) => k !== (rentMode === "rent_shared" ? "rent1room" : "rent_shared")
  );

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#0d1f3c]">Lebenshaltungskosten</h1>
        <p className="text-[#0d1f3c]/40 text-sm mt-0.5">Vergleiche bis zu 3 Städte · Alle Angaben ca.-Werte</p>
      </div>

      {/* City selector */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <input type="text" placeholder="Stadt suchen…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#0d1f3c] focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/10" />
          <div className="flex gap-2">
            <button onClick={() => setRentMode("rent_shared")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${rentMode === "rent_shared" ? "bg-[#0d1f3c] text-white" : "bg-gray-50 text-[#0d1f3c]/60"}`}>
              WG
            </button>
            <button onClick={() => setRentMode("rent1room")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${rentMode === "rent1room" ? "bg-[#0d1f3c] text-white" : "bg-gray-50 text-[#0d1f3c]/60"}`}>
              Eigene Wohnung
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {filtered.map((city) => {
            const isSelected = selected.includes(city.id);
            return (
              <button key={city.id} onClick={() => toggleCity(city.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all border ${
                  isSelected ? "bg-[#0d1f3c] text-white border-[#0d1f3c]" : "bg-gray-50 text-[#0d1f3c]/70 border-gray-100 hover:border-[#0d1f3c]/30"
                }`}>
                {city.flag} {city.name}
                {isSelected && <span className="text-white/50">✓</span>}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-[#0d1f3c]/30 mt-3">Wähle 1–3 Städte zum Vergleichen</p>
      </div>

      {/* Monthly total header */}
      <div className={`grid gap-4 mb-4`} style={{ gridTemplateColumns: `repeat(${selectedCities.length}, 1fr)` }}>
        {selectedCities.map((city) => (
          <div key={city.id} className="bg-[#0d1f3c] text-white rounded-2xl p-5">
            <p className="text-3xl mb-1">{city.flag}</p>
            <p className="font-extrabold text-lg">{city.name}</p>
            <p className="text-white/40 text-xs mb-3">{city.country}</p>
            <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-0.5">Gesamt/Monat (ca.)</p>
            <p className="text-2xl font-extrabold">{fmt(monthlyTotal(city), city.currency)}</p>
          </div>
        ))}
      </div>

      {/* Cost rows */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {costKeys.map((key, i) => {
          const max = Math.max(...selectedCities.map((c) => c.costs[key]));
          return (
            <div key={key} className={`px-5 py-4 ${i !== 0 ? "border-t border-gray-50" : ""}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">{COST_ICONS[key]}</span>
                <span className="text-sm font-bold text-[#0d1f3c]">{COST_LABELS[key]}</span>
                {key === "eating_out" || key === "coffee"
                  ? <span className="text-xs text-[#0d1f3c]/30">(× 20 Tage/Monat)</span>
                  : null}
              </div>
              <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${selectedCities.length}, 1fr)` }}>
                {selectedCities.map((city) => {
                  const val = city.costs[key];
                  const monthly = (key === "eating_out" || key === "coffee") ? val * 20 : val;
                  const pct = max > 0 ? (val / max) * 100 : 0;
                  const isCheapest = val === Math.min(...selectedCities.map((c) => c.costs[key]));
                  return (
                    <div key={city.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-extrabold text-[#0d1f3c]">{fmt(val, city.currency)}</span>
                        {isCheapest && selectedCities.length > 1 && <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded-full">günstig</span>}
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: isCheapest && selectedCities.length > 1 ? "#22c55e" : "#0d1f3c" }} />
                      </div>
                      {(key === "eating_out" || key === "coffee") && (
                        <p className="text-xs text-[#0d1f3c]/30 mt-1">≈ {fmt(monthly, city.currency)}/Mo</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-[#0d1f3c]/20 text-center mt-4">
        Alle Angaben sind Durchschnittswerte (Stand 2026) und dienen nur zur Orientierung. Quelle: Numbeo, lokale Marktdaten.
      </p>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Landmark, Tv, Smartphone, ShoppingCart, Package, Car, UtensilsCrossed, Coffee,
  Search, Dumbbell, Percent, Globe, Recycle, BookOpen, Zap, Plane, Handshake, FileCheck,
  ThumbsUp, ThumbsDown, RotateCcw, PiggyBank, Sparkles, ArrowRight,
  type LucideIcon,
} from "lucide-react";

type TipCard = {
  id: string;
  category: string;
  icon: LucideIcon;
  color: string;
  statement: string;
  tip: string;
  monthly: number;
  cta?: { href: string; label: string };
};

const CARDS: TipCard[] = [
  { id: "bank", category: "Banking", icon: Landmark, color: "#0ea5e9", monthly: 8,
    statement: "Du zahlst noch monatliche Kontoführungsgebühren.",
    tip: "Wechsle zu einem kostenlosen Online-Konto (z. B. DKB, ING) — spart bares Geld ohne Komfortverlust." },
  { id: "subs", category: "Abos", icon: Tv, color: "#ec4899", monthly: 15,
    statement: "Du hast Streaming- oder App-Abos, die du kaum nutzt.",
    tip: "Check deinen Abo-Tracker und kündige, was du seit 4 Wochen nicht genutzt hast.",
    cta: { href: "/dashboard/subscriptions", label: "Abos checken" } },
  { id: "phone", category: "Handy", icon: Smartphone, color: "#8b5cf6", monthly: 12,
    statement: "Dein Handyvertrag kostet mehr als 15 € im Monat.",
    tip: "Discount-Anbieter nutzen oft dasselbe Netz für die Hälfte des Preises." },
  { id: "groceries", category: "Lebensmittel", icon: ShoppingCart, color: "#22c55e", monthly: 25,
    statement: "Du kaufst meist Markenprodukte statt Eigenmarken.",
    tip: "Eigenmarken sind oft baugleich und 20–30 % günstiger." },
  { id: "impulse", category: "Online-Shopping", icon: Package, color: "#f97316", monthly: 30,
    statement: "Du bestellst öfter spontan online, ohne zu vergleichen.",
    tip: "24h-Regel: Leg es in den Warenkorb, kauf es erst am nächsten Tag, wenn du's noch willst." },
  { id: "car", category: "Transport", icon: Car, color: "#ef4444", monthly: 40,
    statement: "Du fährst kurze Strecken (unter 3 km) meist mit dem Auto.",
    tip: "Fahrrad oder ÖPNV sparen nicht nur Sprit, sondern auch Parkgebühren." },
  { id: "lunch", category: "Essen", icon: UtensilsCrossed, color: "#f59e0b", monthly: 60,
    statement: "Du isst fast täglich auswärts zu Mittag.",
    tip: "Meal Prep am Wochenende spart schnell 100 €+ im Monat." },
  { id: "coffee", category: "Essen", icon: Coffee, color: "#92400e", monthly: 35,
    statement: "Du holst dir täglich einen Coffee-to-go.",
    tip: "Eine eigene Thermoskanne amortisiert sich in unter 2 Wochen." },
  { id: "compare", category: "Allgemein", icon: Search, color: "#06b6d4", monthly: 20,
    statement: "Du vergleichst vor größeren Anschaffungen selten Preise.",
    tip: "Preisvergleichsportale zeigen oft 10–20 % günstigere Alternativen." },
  { id: "gym", category: "Fitness", icon: Dumbbell, color: "#dc2626", monthly: 30,
    statement: "Dein Fitnessstudio nutzt du seltener als 1×/Woche.",
    tip: "Viele Studios bieten flexible 10er-Karten statt festes Abo an." },
  { id: "cashback", category: "Online-Shopping", icon: Percent, color: "#10b981", monthly: 15,
    statement: "Du nutzt selten Rabattcodes oder Cashback beim Online-Shopping.",
    tip: "Browser-Addons finden automatisch Gutscheincodes an der Kasse." },
  { id: "roaming", category: "Reisen", icon: Globe, color: "#0ea5e9", monthly: 10,
    statement: "Du hast im letzten Auslandsurlaub für Roaming bezahlt.",
    tip: "EU-Roaming ist kostenlos — außerhalb der EU hilft eine lokale eSIM.",
    cta: { href: "/dashboard/converter", label: "Währungen ansehen" } },
  { id: "used", category: "Shopping", icon: Recycle, color: "#16a34a", monthly: 20,
    statement: "Du kaufst Elektronik & Möbel meist neu statt gebraucht.",
    tip: "Refurbished-Geräte sind bis zu 40 % günstiger und fast wie neu." },
  { id: "books", category: "Freizeit", icon: BookOpen, color: "#7c3aed", monthly: 10,
    statement: "Du kaufst Bücher, statt sie auszuleihen.",
    tip: "Öffentliche Bibliotheken (auch digital via Onleihe) sind meist kostenlos." },
  { id: "standby", category: "Energie", icon: Zap, color: "#eab308", monthly: 12,
    statement: "Geräte laufen bei dir oft im Standby statt ganz aus.",
    tip: "Schaltbare Steckdosenleisten sparen bis zu 10 % der Stromkosten." },
  { id: "earlybird", category: "Reisen", icon: Plane, color: "#0ea5e9", monthly: 15,
    statement: "Du buchst Flüge oder Bahnfahrten meist kurzfristig.",
    tip: "Frühbucher sparen im Schnitt 20–30 % — plane große Trips voraus." },
  { id: "split", category: "Wohnen", icon: Handshake, color: "#f472b6", monthly: 20,
    statement: "WG- oder Gruppenkosten rechnest du manuell und unklar ab.",
    tip: "Nutze Splittr, um Ausgaben fair und transparent mit deiner Gruppe zu teilen.",
    cta: { href: "/dashboard/split", label: "Splittr öffnen" } },
  { id: "insurance", category: "Versicherung", icon: FileCheck, color: "#64748b", monthly: 12,
    statement: "Du vergleichst Versicherungen selten oder nie.",
    tip: "Ein jährlicher Versicherungsvergleich deckt oft 100 €+ Einsparpotenzial auf." },
];

const RESULT_KEY = "fa_spartipps_result";

type StoredResult = { date: string; picks: Record<string, boolean> };

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function SavingsGamePage() {
  const [view, setView] = useState<"intro" | "game">("intro");
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<Record<string, boolean>>({});
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const savedRef = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RESULT_KEY);
      if (raw) {
        const stored: StoredResult = JSON.parse(raw);
        if (stored.date === todayKey()) {
          setPicks(stored.picks);
          setIndex(CARDS.length);
          setView("game");
          savedRef.current = true;
        }
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (index >= CARDS.length && !savedRef.current && Object.keys(picks).length > 0) {
      savedRef.current = true;
      try {
        localStorage.setItem(RESULT_KEY, JSON.stringify({ date: todayKey(), picks } satisfies StoredResult));
      } catch { /* ignore */ }
    }
  }, [index, picks]);

  const current = CARDS[index];
  const finished = index >= CARDS.length;
  const matched = CARDS.filter((c) => picks[c.id]);
  const totalMonthly = matched.reduce((s, c) => s + c.monthly, 0);
  const suggestions = CARDS.slice(0, 3);

  function commitSwipe(liked: boolean) {
    if (!current) return;
    setPicks((p) => ({ ...p, [current.id]: liked }));
    setDragging(false);
    setDragX(liked ? 600 : -600);
    setTimeout(() => {
      setDragX(0);
      setIndex((i) => i + 1);
    }, 200);
  }

  function onPointerDown(e: React.PointerEvent) {
    startX.current = e.clientX;
    setDragging(true);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    setDragX(e.clientX - startX.current);
  }
  function onPointerUp() {
    if (!dragging) return;
    setDragging(false);
    if (Math.abs(dragX) > 90) {
      commitSwipe(dragX > 0);
    } else {
      setDragX(0);
    }
  }

  function restart() {
    savedRef.current = false;
    try { localStorage.removeItem(RESULT_KEY); } catch { /* ignore */ }
    setPicks({});
    setIndex(0);
    setDragX(0);
    setView("game");
  }

  return (
    <div className="p-4 md:p-8 max-w-xl mx-auto">
      {view === "intro" && (
        <div className="text-center py-10">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
            <PiggyBank className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#0d1f3c] mb-2">Dein Spar-Check</h1>
          <p className="text-[#0d1f3c]/50 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
            {CARDS.length} kurze Aussagen zu deinen Gewohnheiten — wisch nach rechts, wenn sie auf dich zutreffen,
            nach links, wenn nicht. Am Ende bekommst du deinen persönlichen Spar-Plan.
          </p>
          <button
            onClick={() => setView("game")}
            className="inline-flex items-center gap-2 bg-[#0d1f3c] text-white font-bold px-8 py-3.5 rounded-xl hover:bg-[#162d54] transition-colors"
          >
            Los geht's <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {view === "game" && !finished && current && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-extrabold text-[#0d1f3c]">Dein Spar-Check</h1>
            <span className="text-xs font-semibold text-[#0d1f3c]/40">{index + 1} / {CARDS.length}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-8">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${(index / CARDS.length) * 100}%` }}
            />
          </div>

          <div className="relative h-80 select-none">
            {/* Peek of next card */}
            {CARDS[index + 1] && (
              <div className="absolute inset-0 bg-white rounded-3xl shadow-sm border border-gray-100 scale-[0.96] translate-y-2 opacity-60" />
            )}

            <div
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
              className={`absolute inset-0 bg-white rounded-3xl shadow-xl border border-gray-100 p-7 flex flex-col cursor-grab active:cursor-grabbing touch-none ${dragging ? "" : "transition-transform duration-200"}`}
              style={{ transform: `translateX(${dragX}px) rotate(${dragX / 18}deg)` }}
            >
              {/* Swipe hints */}
              <div
                className="absolute top-6 left-6 border-2 border-rose-400 text-rose-500 font-extrabold text-xs uppercase tracking-widest px-3 py-1 rounded-lg -rotate-12"
                style={{ opacity: Math.min(Math.max(-dragX / 90, 0), 1) }}
              >
                Trifft nicht zu
              </div>
              <div
                className="absolute top-6 right-6 border-2 border-emerald-400 text-emerald-500 font-extrabold text-xs uppercase tracking-widest px-3 py-1 rounded-lg rotate-12"
                style={{ opacity: Math.min(Math.max(dragX / 90, 0), 1) }}
              >
                Trifft zu
              </div>

              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                style={{ backgroundColor: `${current.color}18` }}
              >
                <current.icon className="w-7 h-7" style={{ color: current.color }} />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: current.color }}>
                {current.category}
              </p>
              <p className="text-xl font-extrabold text-[#0d1f3c] leading-snug flex-1">{current.statement}</p>
              <p className="text-[11px] text-[#0d1f3c]/30 text-center">← nicht ich · das bin ich →</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mt-8">
            <button
              onClick={() => commitSwipe(false)}
              className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-colors"
              aria-label="Trifft nicht zu"
            >
              <ThumbsDown className="w-6 h-6" />
            </button>
            <button
              onClick={() => commitSwipe(true)}
              className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center hover:bg-emerald-100 transition-colors"
              aria-label="Trifft zu"
            >
              <ThumbsUp className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {view === "game" && finished && (
        <div>
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#0d1f3c] mb-1">Dein Spar-Plan</h1>
            {matched.length > 0 ? (
              <p className="text-[#0d1f3c]/50 text-sm">
                {matched.length} Gewohnheit{matched.length > 1 ? "en" : ""} mit Sparpotenzial gefunden.
              </p>
            ) : (
              <p className="text-[#0d1f3c]/50 text-sm">Du machst schon vieles richtig!</p>
            )}
          </div>

          {matched.length > 0 && (
            <div className="bg-[#0d1f3c] text-white rounded-2xl p-6 mb-6 text-center">
              <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">Geschätztes Sparpotenzial</p>
              <p className="text-4xl font-extrabold mb-1">{totalMonthly} €<span className="text-lg font-bold text-white/50">/Monat</span></p>
              <p className="text-white/40 text-sm">≈ {totalMonthly * 12} € im Jahr</p>
            </div>
          )}

          <div className="space-y-3 mb-6">
            {(matched.length > 0 ? matched : suggestions).map((c) => (
              <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${c.color}18` }}
                >
                  <c.icon className="w-5 h-5" style={{ color: c.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#0d1f3c] leading-snug">{c.tip}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                      ≈ {c.monthly} €/Monat
                    </span>
                    {c.cta && (
                      <Link href={c.cta.href} className="text-[10px] font-bold text-[#0d1f3c]/50 hover:text-[#0d1f3c] inline-flex items-center gap-0.5">
                        {c.cta.label} <ArrowRight className="w-2.5 h-2.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {matched.length === 0 && (
            <p className="text-xs text-[#0d1f3c]/30 text-center mb-6">
              Hier trotzdem 3 Ideen, die sich für die meisten lohnen.
            </p>
          )}

          <button
            onClick={restart}
            className="w-full inline-flex items-center justify-center gap-2 border border-gray-200 text-[#0d1f3c]/60 font-bold py-3.5 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Nochmal spielen
          </button>
        </div>
      )}
    </div>
  );
}

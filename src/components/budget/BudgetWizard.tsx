"use client";

import { useState } from "react";
import { formatCurrency, CATEGORY_LABELS, CATEGORY_ICONS, CURRENCIES } from "@/lib/utils";
import type { ExpenseCategory } from "@/types";
import type { usePlanner } from "@/hooks/usePlanner";

const CATEGORIES: ExpenseCategory[] = ["miete", "essen", "transport", "freizeit", "gesundheit", "sonstiges"];

/** Grobe Richtwerte in % vom Einkommen – Ausgangspunkt fürs Nachdenken, keine harte Regel. */
const BENCHMARK: Record<ExpenseCategory, number> = {
  miete: 35,
  essen: 15,
  transport: 10,
  freizeit: 10,
  gesundheit: 5,
  sonstiges: 25,
};

type Priority = "ausgewogen" | "sparen" | "geniessen" | "sicherheit";

const PRIORITIES: { id: Priority; label: string; icon: string; desc: string; adjust: Partial<Record<ExpenseCategory, number>> }[] = [
  { id: "ausgewogen", label: "Ausgewogen", icon: "⚖️", desc: "Ein bisschen von allem", adjust: {} },
  { id: "sparen", label: "Mehr sparen", icon: "🌱", desc: "Rücklagen aufbauen", adjust: { freizeit: -5, sonstiges: 5 } },
  { id: "geniessen", label: "Leben genießen", icon: "🎉", desc: "Freizeit hat Priorität", adjust: { freizeit: 5, sonstiges: -5 } },
  { id: "sicherheit", label: "Sicherheit", icon: "🛡️", desc: "Puffer für Unerwartetes", adjust: { freizeit: -5, gesundheit: 2, sonstiges: 3 } },
];

const REFLECTIONS = [
  { id: "eng", label: "Fühlt sich eng an", icon: "😬", note: "Vielleicht lohnt sich ein zweiter Blick auf die größten Posten – oder das Ziel etwas lockerer angehen." },
  { id: "passt", label: "Passt gut", icon: "🙂", note: "Guter Rahmen. Schau in ein paar Wochen nochmal rein, ob die Realität mit dem Plan übereinstimmt." },
  { id: "luft", label: "Viel Luft", icon: "😌", note: "Du hast Spielraum – vielleicht ein gutes Zeichen, mehr davon Richtung Sparen oder Ziele zu verschieben." },
] as const;

type Step = "income" | "priority" | "allocate" | "reflect";

export default function BudgetWizard({
  planner,
  currency: initialCurrency,
  onClose,
  onSaved,
}: {
  planner: ReturnType<typeof usePlanner>;
  currency: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [step, setStep] = useState<Step>("income");
  const [income, setIncome] = useState(() => String(planner.totalBudget() || ""));
  const [cur, setCur] = useState(initialCurrency);
  const [priority, setPriority] = useState<Priority>("ausgewogen");
  const [percents, setPercents] = useState<Record<ExpenseCategory, number> | null>(null);
  const [reflection, setReflection] = useState<(typeof REFLECTIONS)[number]["id"] | null>(null);

  const incomeNum = parseFloat(income) || 0;

  function startAllocation() {
    const adjust = PRIORITIES.find((p) => p.id === priority)?.adjust ?? {};
    const base: Record<ExpenseCategory, number> = { ...BENCHMARK };
    for (const cat of CATEGORIES) base[cat] = Math.max(0, base[cat] + (adjust[cat] ?? 0));
    setPercents(base);
    setStep("allocate");
  }

  const totalPct = percents ? CATEGORIES.reduce((s, c) => s + percents[c], 0) : 0;
  const overAllocated = totalPct > 100;

  function updatePct(cat: ExpenseCategory, value: number) {
    setPercents((prev) => (prev ? { ...prev, [cat]: value } : prev));
  }

  function handleFinish() {
    for (const cat of CATEGORIES) {
      const pct = percents?.[cat] ?? 0;
      planner.updateBudget(cat, Math.round((incomeNum * pct) / 100));
    }
    planner.setCurrency(cur);
    onSaved();
  }

  const stepIndex = { income: 0, priority: 1, allocate: 2, reflect: 3 }[step];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Progress */}
        <div className="flex gap-1.5 p-5 pb-0">
          {["income", "priority", "allocate", "reflect"].map((s, i) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full ${i <= stepIndex ? "bg-[#0d1f3c]" : "bg-gray-100"}`} />
          ))}
        </div>

        <div className="p-6 md:p-8">
          {/* Step 1: Income */}
          {step === "income" && (
            <div>
              <p className="text-4xl mb-4">💶</p>
              <h2 className="text-xl font-extrabold text-[#0d1f3c] mb-2">Wie viel Geld hast du monatlich?</h2>
              <p className="text-[#0d1f3c]/50 text-sm mb-6">
                Dein Netto-Budget – nach Steuern, inkl. BAföG/Stipendium/Nebenjob. Das ist die Basis für alles Weitere.
              </p>
              <div className="flex gap-2 mb-8">
                <input
                  type="number"
                  min="0"
                  step="10"
                  autoFocus
                  placeholder="z. B. 1200"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3.5 text-lg font-semibold text-[#0d1f3c] focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20"
                />
                <select
                  value={cur}
                  onChange={(e) => setCur(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 text-sm text-[#0d1f3c] bg-white focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20"
                >
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex justify-between">
                <button onClick={onClose} className="text-sm font-semibold text-[#0d1f3c]/40 hover:text-[#0d1f3c] px-4 py-2">
                  Abbrechen
                </button>
                <button
                  disabled={incomeNum <= 0}
                  onClick={() => setStep("priority")}
                  className="bg-[#0d1f3c] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#162d54] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Weiter →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Priority */}
          {step === "priority" && (
            <div>
              <p className="text-4xl mb-4">🧭</p>
              <h2 className="text-xl font-extrabold text-[#0d1f3c] mb-2">Was ist dir gerade am wichtigsten?</h2>
              <p className="text-[#0d1f3c]/50 text-sm mb-6">
                Es gibt kein falsches Ziel – das hilft nur, einen sinnvollen Startpunkt für deine Verteilung zu finden.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPriority(p.id)}
                    className={`text-left p-4 rounded-2xl border-2 transition-all ${
                      priority === p.id ? "border-[#0d1f3c] bg-[#0d1f3c]/5" : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className="text-2xl mb-2">{p.icon}</div>
                    <p className="font-bold text-sm text-[#0d1f3c]">{p.label}</p>
                    <p className="text-xs text-[#0d1f3c]/40">{p.desc}</p>
                  </button>
                ))}
              </div>
              <div className="flex justify-between">
                <button onClick={() => setStep("income")} className="text-sm font-semibold text-[#0d1f3c]/40 hover:text-[#0d1f3c] px-4 py-2">
                  ← Zurück
                </button>
                <button
                  onClick={startAllocation}
                  className="bg-[#0d1f3c] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#162d54] transition-colors"
                >
                  Weiter →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Allocate */}
          {step === "allocate" && percents && (
            <div>
              <h2 className="text-xl font-extrabold text-[#0d1f3c] mb-1">Verteile dein Budget</h2>
              <p className="text-[#0d1f3c]/50 text-sm mb-5">
                Zieh die Regler. Die grauen Marken zeigen einen groben Richtwert – weicht dein Wert stark ab, ist das
                kein Fehler, aber ein guter Moment zum Nachdenken.
              </p>

              <div className={`rounded-xl px-4 py-2.5 mb-5 text-sm font-semibold flex justify-between ${overAllocated ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-700"}`}>
                <span>Verteilt: {totalPct}%</span>
                <span>{formatCurrency((incomeNum * totalPct) / 100, cur)} von {formatCurrency(incomeNum, cur)}</span>
              </div>

              <div className="space-y-5 mb-6">
                {CATEGORIES.map((cat) => {
                  const pct = percents[cat];
                  const benchmark = BENCHMARK[cat];
                  const deviates = Math.abs(pct - benchmark) >= 10;
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-[#0d1f3c] flex items-center gap-1.5">
                          {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
                        </span>
                        <span className="text-sm font-bold text-[#0d1f3c]">
                          {pct}% · {formatCurrency((incomeNum * pct) / 100, cur)}
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="range"
                          min={0}
                          max={60}
                          step={1}
                          value={pct}
                          onChange={(e) => updatePct(cat, Number(e.target.value))}
                          className="w-full accent-[#0d1f3c]"
                        />
                        <div
                          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-[#0d1f3c]/25 pointer-events-none"
                          style={{ left: `${(benchmark / 60) * 100}%` }}
                          title={`Richtwert: ${benchmark}%`}
                        />
                      </div>
                      {deviates && (
                        <p className="text-[11px] text-amber-600 mt-1">
                          🤔 {pct > benchmark ? "Deutlich mehr" : "Deutlich weniger"} als der Richtwert ({benchmark}%) — passt das zu dir, oder lohnt sich ein zweiter Blick?
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between">
                <button onClick={() => setStep("priority")} className="text-sm font-semibold text-[#0d1f3c]/40 hover:text-[#0d1f3c] px-4 py-2">
                  ← Zurück
                </button>
                <button
                  onClick={() => setStep("reflect")}
                  className="bg-[#0d1f3c] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#162d54] transition-colors"
                >
                  Weiter →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Reflect + save */}
          {step === "reflect" && (
            <div>
              <p className="text-4xl mb-4">💭</p>
              <h2 className="text-xl font-extrabold text-[#0d1f3c] mb-2">Wie fühlt sich dieses Budget an?</h2>
              <p className="text-[#0d1f3c]/50 text-sm mb-6">Kurz und ehrlich – das hilft dir mehr als jede Formel.</p>

              <div className="space-y-2.5 mb-6">
                {REFLECTIONS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setReflection(r.id)}
                    className={`w-full text-left flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                      reflection === r.id ? "border-[#0d1f3c] bg-[#0d1f3c]/5" : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <span className="text-2xl">{r.icon}</span>
                    <span className="font-semibold text-sm text-[#0d1f3c]">{r.label}</span>
                  </button>
                ))}
              </div>

              {reflection && (
                <div className="bg-[#0d1f3c]/5 rounded-2xl p-4 mb-6 text-sm text-[#0d1f3c]/70">
                  {REFLECTIONS.find((r) => r.id === reflection)?.note}
                </div>
              )}

              <div className="flex justify-between">
                <button onClick={() => setStep("allocate")} className="text-sm font-semibold text-[#0d1f3c]/40 hover:text-[#0d1f3c] px-4 py-2">
                  ← Zurück
                </button>
                <button
                  onClick={handleFinish}
                  className="bg-[#0d1f3c] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#162d54] transition-colors"
                >
                  Budget übernehmen ✓
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

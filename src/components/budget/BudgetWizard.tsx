"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { formatCurrency, CURRENCIES } from "@/lib/utils";
import { useCategoryLabels } from "@/hooks/useCategoryLabels";
import CategoryIcon from "@/components/ui/CategoryIcon";
import type { ExpenseCategory } from "@/types";
import type { usePlanner } from "@/hooks/usePlanner";
import { Wallet, Compass, MessageCircle, Scale, Sprout, PartyPopper, Shield, Frown, Smile, Laugh, ArrowRight, ArrowLeft, Check, Lightbulb, type LucideIcon } from "lucide-react";

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
type ReflectionId = "eng" | "passt" | "luft";

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
  const t = useTranslations("BudgetWizard");
  const CATEGORY_LABELS = useCategoryLabels();
  const [step, setStep] = useState<Step>("income");
  const [income, setIncome] = useState(() => String(planner.totalBudget() || ""));
  const [cur, setCur] = useState(initialCurrency);
  const [priority, setPriority] = useState<Priority>("ausgewogen");
  const [percents, setPercents] = useState<Record<ExpenseCategory, number> | null>(null);
  const [reflection, setReflection] = useState<ReflectionId | null>(null);

  const PRIORITIES: { id: Priority; label: string; icon: LucideIcon; color: string; desc: string; adjust: Partial<Record<ExpenseCategory, number>> }[] = [
    { id: "ausgewogen", label: t("priorityAusgewogenLabel"), icon: Scale, color: "#3b82f6", desc: t("priorityAusgewogenDesc"), adjust: {} },
    { id: "sparen", label: t("prioritySparenLabel"), icon: Sprout, color: "#10b981", desc: t("prioritySparenDesc"), adjust: { freizeit: -5, sonstiges: 5 } },
    { id: "geniessen", label: t("priorityGeniessenLabel"), icon: PartyPopper, color: "#ec4899", desc: t("priorityGeniessenDesc"), adjust: { freizeit: 5, sonstiges: -5 } },
    { id: "sicherheit", label: t("prioritySicherheitLabel"), icon: Shield, color: "#f59e0b", desc: t("prioritySicherheitDesc"), adjust: { freizeit: -5, gesundheit: 2, sonstiges: 3 } },
  ];

  const REFLECTIONS: { id: ReflectionId; label: string; icon: LucideIcon; color: string; note: string }[] = [
    { id: "eng", label: t("reflectionEngLabel"), icon: Frown, color: "#f43f5e", note: t("reflectionEngNote") },
    { id: "passt", label: t("reflectionPasstLabel"), icon: Smile, color: "#10b981", note: t("reflectionPasstNote") },
    { id: "luft", label: t("reflectionLuftLabel"), icon: Laugh, color: "#3b82f6", note: t("reflectionLuftNote") },
  ];

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
              <Wallet className="w-9 h-9 text-emerald-500 mb-4" />
              <h2 className="text-xl font-extrabold text-[#0d1f3c] mb-2">{t("incomeTitle")}</h2>
              <p className="text-[#0d1f3c]/50 text-sm mb-6">
                {t("incomeDesc")}
              </p>
              <div className="flex gap-2 mb-8">
                <input
                  type="number"
                  min="0"
                  step="10"
                  autoFocus
                  placeholder={t("incomePlaceholder")}
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
                  {t("cancel")}
                </button>
                <button
                  disabled={incomeNum <= 0}
                  onClick={() => setStep("priority")}
                  className="bg-[#0d1f3c] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#162d54] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span className="inline-flex items-center gap-1.5">{t("next")} <ArrowRight className="w-4 h-4" /></span>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Priority */}
          {step === "priority" && (
            <div>
              <Compass className="w-9 h-9 text-blue-500 mb-4" />
              <h2 className="text-xl font-extrabold text-[#0d1f3c] mb-2">{t("priorityTitle")}</h2>
              <p className="text-[#0d1f3c]/50 text-sm mb-6">
                {t("priorityDesc")}
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
                    <div className="mb-2"><p.icon className="w-6 h-6" style={{ color: p.color }} /></div>
                    <p className="font-bold text-sm text-[#0d1f3c]">{p.label}</p>
                    <p className="text-xs text-[#0d1f3c]/40">{p.desc}</p>
                  </button>
                ))}
              </div>
              <div className="flex justify-between">
                <button onClick={() => setStep("income")} className="text-sm font-semibold text-[#0d1f3c]/40 hover:text-[#0d1f3c] px-4 py-2">
                  <span className="inline-flex items-center gap-1.5"><ArrowLeft className="w-4 h-4" /> {t("back")}</span>
                </button>
                <button
                  onClick={startAllocation}
                  className="bg-[#0d1f3c] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#162d54] transition-colors"
                >
                  <span className="inline-flex items-center gap-1.5">{t("next")} <ArrowRight className="w-4 h-4" /></span>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Allocate */}
          {step === "allocate" && percents && (
            <div>
              <h2 className="text-xl font-extrabold text-[#0d1f3c] mb-1">{t("allocateTitle")}</h2>
              <p className="text-[#0d1f3c]/50 text-sm mb-5">
                {t("allocateDesc")}
              </p>

              <div className={`rounded-xl px-4 py-2.5 mb-5 text-sm font-semibold flex justify-between ${overAllocated ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-700"}`}>
                <span>{t("distributed", { pct: totalPct })}</span>
                <span>{formatCurrency((incomeNum * totalPct) / 100, cur)} {t("of")} {formatCurrency(incomeNum, cur)}</span>
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
                          <CategoryIcon category={cat} className="w-4 h-4" /> {CATEGORY_LABELS[cat]}
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
                          title={t("benchmarkTitle", { value: benchmark })}
                        />
                      </div>
                      {deviates && (
                        <p className="text-[11px] text-amber-600 mt-1 flex items-start gap-1">
                          <Lightbulb className="w-3.5 h-3.5 flex-shrink-0 mt-px" />
                          <span>{pct > benchmark ? t("deviatesMore") : t("deviatesLess")} {t("deviatesText", { benchmark })}</span>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between">
                <button onClick={() => setStep("priority")} className="text-sm font-semibold text-[#0d1f3c]/40 hover:text-[#0d1f3c] px-4 py-2">
                  <span className="inline-flex items-center gap-1.5"><ArrowLeft className="w-4 h-4" /> {t("back")}</span>
                </button>
                <button
                  onClick={() => setStep("reflect")}
                  className="bg-[#0d1f3c] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#162d54] transition-colors"
                >
                  <span className="inline-flex items-center gap-1.5">{t("next")} <ArrowRight className="w-4 h-4" /></span>
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Reflect + save */}
          {step === "reflect" && (
            <div>
              <MessageCircle className="w-9 h-9 text-violet-500 mb-4" />
              <h2 className="text-xl font-extrabold text-[#0d1f3c] mb-2">{t("reflectTitle")}</h2>
              <p className="text-[#0d1f3c]/50 text-sm mb-6">{t("reflectDesc")}</p>

              <div className="space-y-2.5 mb-6">
                {REFLECTIONS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setReflection(r.id)}
                    className={`w-full text-left flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                      reflection === r.id ? "border-[#0d1f3c] bg-[#0d1f3c]/5" : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <r.icon className="w-6 h-6" style={{ color: r.color }} />
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
                  <span className="inline-flex items-center gap-1.5"><ArrowLeft className="w-4 h-4" /> {t("back")}</span>
                </button>
                <button
                  onClick={handleFinish}
                  className="bg-[#0d1f3c] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#162d54] transition-colors"
                >
                  <span className="inline-flex items-center gap-1.5">{t("adopt")} <Check className="w-4 h-4" /></span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

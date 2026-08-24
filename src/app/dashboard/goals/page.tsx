"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Plane, Home, GraduationCap, Car, Laptop, Palmtree, Gem, Backpack,
  Dumbbell, Smartphone, Guitar, Globe, Check, ArrowRight, Target, Plus,
  type LucideIcon,
} from "lucide-react";

type Goal = {
  id: string;
  name: string;
  icon: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  deadline?: string;
  color: string;
};

const COLORS = ["#0d1f3c", "#4285F4", "#E30613", "#34A853", "#FF6200", "#9333ea", "#0891b2", "#f59e0b"];
const GOAL_ICONS: Record<string, LucideIcon> = {
  plane: Plane, home: Home, education: GraduationCap, car: Car, laptop: Laptop,
  vacation: Palmtree, ring: Gem, backpack: Backpack, fitness: Dumbbell,
  phone: Smartphone, music: Guitar, world: Globe,
};
const GOAL_ICON_COLORS: Record<string, string> = {
  plane: "#0ea5e9", home: "#f97316", education: "#8b5cf6", car: "#ef4444", laptop: "#64748b",
  vacation: "#22c55e", ring: "#ec4899", backpack: "#d97706", fitness: "#dc2626",
  phone: "#06b6d4", music: "#a855f7", world: "#10b981",
};
const ICONS = Object.keys(GOAL_ICONS);
const CURRENCIES = ["EUR", "USD", "GBP", "CHF", "JPY", "AUD", "CAD"];

function GoalIcon({ id, className = "w-5 h-5", style }: { id: string; className?: string; style?: React.CSSProperties }) {
  const Icon = GOAL_ICONS[id] ?? Plane;
  return <Icon className={className} style={style} />;
}

export default function GoalsPage() {
  const t = useTranslations("Goals");
  const locale = useLocale();

  function fmt(n: number, cur = "EUR") {
    return new Intl.NumberFormat(locale, { style: "currency", currency: cur, maximumFractionDigits: cur === "JPY" ? 0 : 2 }).format(n);
  }

  const [goals, setGoals] = useState<Goal[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [modal, setModal] = useState<"none" | "create" | "deposit">("none");
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [depositAmount, setDepositAmount] = useState("");

  // Form
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("plane");
  const [target, setTarget] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [deadline, setDeadline] = useState("");
  const [color, setColor] = useState("#0d1f3c");

  useEffect(() => {
    try { const g = localStorage.getItem("fa_goals"); if (g) setGoals(JSON.parse(g)); } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("fa_goals", JSON.stringify(goals));
  }, [goals, loaded]);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !target || parseFloat(target) <= 0) return;
    const goal: Goal = {
      id: crypto.randomUUID(), name: name.trim(), icon, color,
      targetAmount: parseFloat(target.replace(",", ".")),
      currentAmount: 0, currency, deadline: deadline || undefined,
    };
    setGoals((p) => [...p, goal]);
    setModal("none"); setName(""); setTarget(""); setDeadline(""); setIcon("plane"); setColor("#0d1f3c");
  }

  function handleDeposit() {
    if (!activeGoal || !depositAmount) return;
    const amount = parseFloat(depositAmount.replace(",", "."));
    if (isNaN(amount) || amount <= 0) return;
    setGoals((p) => p.map((g) => g.id === activeGoal.id
      ? { ...g, currentAmount: Math.min(g.targetAmount, g.currentAmount + amount) }
      : g));
    setModal("none"); setDepositAmount("");
  }

  function removeGoal(id: string) {
    setGoals((p) => p.filter((g) => g.id !== id));
  }

  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">

      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0d1f3c]">{t("title")}</h1>
          <p className="text-[#0d1f3c]/40 text-sm mt-0.5">{t("subtitle", { count: goals.length, saved: fmt(totalSaved) })}</p>
        </div>
        <button onClick={() => setModal("create")} className="inline-flex items-center gap-1.5 bg-[#0d1f3c] text-white font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-[#162d54] transition-colors flex-shrink-0">
          <span className="leading-none">+</span> {t("newGoal")}
        </button>
      </div>

      {/* Summary */}
      {goals.length > 0 && (
        <div className="bg-[#0d1f3c] text-white rounded-2xl p-5 mb-6">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">{t("totalSaved")}</p>
              <p className="text-3xl font-extrabold">{fmt(totalSaved)}</p>
              <p className="text-white/40 text-xs mt-0.5">{t("ofTarget", { total: fmt(totalTarget) })}</p>
            </div>
            <p className="text-4xl font-extrabold text-white/20">{Math.round((totalSaved / totalTarget) * 100)}%</p>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-white/60 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, (totalSaved / totalTarget) * 100)}%` }} />
          </div>
        </div>
      )}

      {/* Goals grid */}
      {goals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
          <Target className="w-10 h-10 mb-4 mx-auto text-emerald-400" />
          <h3 className="font-extrabold text-[#0d1f3c] text-lg mb-2">{t("emptyTitle")}</h3>
          <p className="text-[#0d1f3c]/40 text-sm mb-6">{t("emptyDesc")}</p>
          <button onClick={() => setModal("create")} className="inline-flex items-center gap-1.5 bg-[#0d1f3c] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#162d54] transition-colors">
            {t("createFirst")} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const pct = Math.min(100, goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0);
            const done = pct >= 100;
            const remaining = goal.targetAmount - goal.currentAmount;
            const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000) : null;

            return (
              <div key={goal.id} className="bg-white rounded-2xl border border-gray-100 p-5 relative overflow-hidden">
                {done && <div className="absolute top-3 right-3 bg-emerald-50 text-emerald-600 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1"><Check className="w-3 h-3" /> {t("achieved")}</div>}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${goal.color}15` }}>
                    <GoalIcon id={goal.icon} className="w-6 h-6" style={{ color: goal.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-[#0d1f3c] truncate">{goal.name}</p>
                    <p className="text-xs text-[#0d1f3c]/40">
                      {fmt(goal.currentAmount, goal.currency)} {t("of")} {fmt(goal.targetAmount, goal.currency)}
                      {daysLeft !== null && <span className="ml-2">{daysLeft > 0 ? t("days", { days: daysLeft }) : t("due")}</span>}
                    </p>
                  </div>
                  <button onClick={() => removeGoal(goal.id)} className="text-gray-200 hover:text-rose-400 transition-colors text-xl leading-none">×</button>
                </div>

                {/* Progress bar */}
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: done ? "#22c55e" : goal.color }} />
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold" style={{ color: goal.color }}>{Math.round(pct)}%</p>
                  {!done && <p className="text-xs text-[#0d1f3c]/40">{t("remaining", { amount: fmt(remaining, goal.currency) })}</p>}
                  <button onClick={() => { setActiveGoal(goal); setDepositAmount(""); setModal("deposit"); }}
                    className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl text-white transition-colors"
                    style={{ background: goal.color }}>
                    <Plus className="w-3 h-3" /> {t("deposit")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {modal === "create" && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setModal("none"); }}>
          <div className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-extrabold text-[#0d1f3c] text-lg">{t("newGoalModalTitle")}</h2>
              <button onClick={() => setModal("none")} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              {/* Icon picker */}
              <div>
                <label className="block text-xs font-bold text-[#0d1f3c]/50 uppercase tracking-widest mb-2">{t("symbol")}</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map((i) => (
                    <button key={i} type="button" onClick={() => setIcon(i)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${icon === i ? "bg-[#0d1f3c] text-white shadow-md scale-110" : "bg-gray-50 text-[#0d1f3c]/60 hover:bg-gray-100"}`}>
                      <GoalIcon id={i} className="w-5 h-5" style={{ color: icon === i ? undefined : GOAL_ICON_COLORS[i] }} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0d1f3c]/50 uppercase tracking-widest mb-2">{t("name")}</label>
                <input autoFocus type="text" placeholder={t("namePlaceholder")} value={name} onChange={(e) => setName(e.target.value)} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-[#0d1f3c]/50 uppercase tracking-widest mb-2">{t("targetAmount")}</label>
                  <input type="text" inputMode="decimal" placeholder="1.000" value={target} onChange={(e) => setTarget(e.target.value.replace(/[^0-9.,]/g, ""))} required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20" />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-bold text-[#0d1f3c]/50 uppercase tracking-widest mb-2">{t("currency")}</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-[#0d1f3c] bg-white focus:outline-none">
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0d1f3c]/50 uppercase tracking-widest mb-2">{t("targetDate")}</label>
                <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0d1f3c]/50 uppercase tracking-widest mb-2">{t("color")}</label>
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full transition-all ${color === c ? "scale-125 ring-2 ring-offset-2 ring-gray-400" : ""}`}
                      style={{ background: c }} />
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full inline-flex items-center justify-center gap-1.5 bg-[#0d1f3c] text-white rounded-xl py-3.5 font-bold text-sm hover:bg-[#162d54] transition-colors">
                {t("createGoal")} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {modal === "deposit" && activeGoal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setModal("none"); }}>
          <div className="bg-white w-full md:max-w-sm rounded-t-3xl md:rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${activeGoal.color}15` }}>
                <GoalIcon id={activeGoal.icon} className="w-6 h-6" style={{ color: activeGoal.color }} />
              </div>
              <div>
                <h2 className="font-extrabold text-[#0d1f3c]">{activeGoal.name}</h2>
                <p className="text-xs text-[#0d1f3c]/40">{fmt(activeGoal.currentAmount, activeGoal.currency)} {t("of")} {fmt(activeGoal.targetAmount, activeGoal.currency)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 border-2 border-gray-100 rounded-2xl px-4 py-3 mb-4 focus-within:border-[#0d1f3c]/20">
              <span className="text-2xl font-extrabold text-[#0d1f3c]/30">{activeGoal.currency === "EUR" ? "€" : activeGoal.currency}</span>
              <input autoFocus type="text" inputMode="decimal" placeholder="0,00" value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value.replace(/[^0-9.,]/g, ""))}
                onKeyDown={(e) => { if (e.key === "Enter") handleDeposit(); }}
                className="flex-1 text-3xl font-extrabold text-[#0d1f3c] bg-transparent focus:outline-none placeholder:text-gray-200" />
            </div>
            <div className="flex gap-2 mb-4">
              {["10", "25", "50", "100"].map((v) => (
                <button key={v} onClick={() => setDepositAmount(v)}
                  className="flex-1 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-sm font-bold text-[#0d1f3c]/60 transition-colors border border-gray-100">
                  {v} {activeGoal.currency === "EUR" ? "€" : activeGoal.currency}
                </button>
              ))}
            </div>
            <button onClick={handleDeposit} disabled={!depositAmount}
              className="w-full inline-flex items-center justify-center gap-1.5 py-3.5 rounded-xl font-bold text-white text-sm transition-colors disabled:opacity-30"
              style={{ background: activeGoal.color }}>
              {t("deposit")} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

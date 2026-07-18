"use client";

import { useState } from "react";
import { useSplit } from "@/hooks/useSplit";
import type { SplitGroup } from "@/types";
import type { Settlement } from "@/hooks/useSplit";

function QRShare({ group, settlements }: { group: SplitGroup; settlements: Settlement[] }) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const lines = settlements.map((s) => `${s.fromName} → ${s.toName}: ${new Intl.NumberFormat("de-DE", { style: "currency", currency: group.currency }).format(s.amount)}`).join("\n");
  const text = `${group.emoji} ${group.name} – Abrechnung\n\n${lines || "Alle quitt! 🎉"}\n\nErstellt mit FinanceAbroad`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(text)}&bgcolor=ffffff&color=0d1f3c&margin=10`;

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="font-extrabold text-[#0d1f3c] mb-1">Abrechnung teilen</h3>
      <p className="text-xs text-[#0d1f3c]/40 mb-4">Teile die Abrechnung als QR-Code – kein Account nötig</p>
      <div className="flex gap-3">
        <button onClick={() => setShowQR((v) => !v)}
          className="flex-1 flex items-center justify-center gap-2 bg-[#0d1f3c] text-white rounded-xl py-3 text-sm font-bold hover:bg-[#162d54] transition-colors">
          <span>📱</span> {showQR ? "QR ausblenden" : "QR-Code anzeigen"}
        </button>
        <button onClick={handleCopy}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all border ${copied ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "border-gray-200 text-[#0d1f3c]/60 hover:bg-gray-50"}`}>
          <span>{copied ? "✓" : "📋"}</span> {copied ? "Kopiert!" : "Text kopieren"}
        </button>
      </div>
      {showQR && (
        <div className="mt-4 flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrUrl} alt="QR-Code Abrechnung" className="rounded-2xl border border-gray-100 shadow-sm" width={220} height={220} />
          <p className="text-xs text-[#0d1f3c]/30 text-center">Scannen zum Anzeigen der Abrechnung</p>
        </div>
      )}
    </div>
  );
}

const EMOJIS = ["✈️", "🏠", "🎉", "🍕", "🎓", "🏖️", "🗼", "🎒", "🌍", "🤝", "🍻", "🚗"];
const CURRENCIES = ["EUR", "USD", "GBP", "CHF", "JPY", "AUD", "CAD", "SEK", "NOK", "DKK", "CNY", "SGD"];

function fmt(amount: number, currency: string) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = [
  "bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-amber-500",
  "bg-rose-500", "bg-cyan-500", "bg-indigo-500", "bg-orange-500",
];

export default function SplitPage() {
  const split = useSplit();
  const [view, setView] = useState<"list" | "group" | "create">("list");
  const [activeGroup, setActiveGroup] = useState<SplitGroup | null>(null);
  const [expenseView, setExpenseView] = useState<"expenses" | "balances" | "settle">("expenses");

  // Create group form
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("✈️");
  const [newMembers, setNewMembers] = useState(["", ""]);
  const [newCurrency, setNewCurrency] = useState("EUR");

  // Add expense form
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expTitle, setExpTitle] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expCurrency, setExpCurrency] = useState(activeGroup?.currency ?? "EUR");
  const [expPaidBy, setExpPaidBy] = useState("");
  const [expSplitMode, setExpSplitMode] = useState<"equal" | "custom">("equal");
  const [expCustomSplits, setExpCustomSplits] = useState<Record<string, string>>({});

  function openGroup(group: SplitGroup) {
    setActiveGroup(group);
    setExpPaidBy(group.members[0]?.id ?? "");
    setExpCurrency(group.currency);
    setExpenseView("expenses");
    setShowExpenseForm(false);
    setView("group");
  }

  function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault();
    const names = newMembers.filter((n) => n.trim());
    if (!newName.trim() || names.length < 2) return;
    const group = split.createGroup(newName.trim(), newEmoji, names, newCurrency);
    setNewName(""); setNewEmbers(["", ""]); setNewEmoji("✈️"); setNewCurrency("EUR");
    openGroup(group);
  }

  function setNewEmbers(v: string[]) { setNewMembers(v); }

  function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    if (!activeGroup || !expTitle || !expAmount || !expPaidBy) return;
    const amount = parseFloat(expAmount);
    if (isNaN(amount) || amount <= 0) return;

    let splits: { memberId: string; amount: number }[];
    if (expSplitMode === "equal") {
      const perPerson = amount / activeGroup.members.length;
      splits = activeGroup.members.map((m) => ({ memberId: m.id, amount: Math.round(perPerson * 100) / 100 }));
    } else {
      splits = activeGroup.members.map((m) => ({
        memberId: m.id,
        amount: parseFloat(expCustomSplits[m.id] || "0") || 0,
      }));
    }

    split.addExpense({
      groupId: activeGroup.id,
      title: expTitle,
      amount,
      currency: expCurrency,
      paidBy: expPaidBy,
      splits,
      date: new Date().toISOString().split("T")[0],
    });

    setExpTitle(""); setExpAmount(""); setExpCustomSplits({}); setExpSplitMode("equal");
    setShowExpenseForm(false);
  }

  const refreshedGroup = activeGroup ? split.groups.find((g) => g.id === activeGroup.id) ?? activeGroup : null;

  // ── LIST VIEW ──────────────────────────────────────────────────────────
  if (view === "list") {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0d1f3c]">Splittr</h1>
            <p className="text-[#0d1f3c]/40 text-sm">Ausgaben fair teilen mit Freunden im Ausland</p>
          </div>
          <button
            onClick={() => setView("create")}
            className="bg-[#0d1f3c] text-white font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-[#162d54] transition-colors flex items-center gap-2"
          >
            <span className="text-base">+</span> Neue Gruppe
          </button>
        </div>

        {split.groups.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
            <div className="text-5xl mb-4">🤝</div>
            <h3 className="font-extrabold text-[#0d1f3c] text-lg mb-2">Noch keine Gruppe</h3>
            <p className="text-[#0d1f3c]/40 text-sm mb-6">Erstelle deine erste Gruppe – für den Urlaub, die WG oder das nächste Event.</p>
            <button
              onClick={() => setView("create")}
              className="bg-[#0d1f3c] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#162d54] transition-colors"
            >
              Erste Gruppe erstellen
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {split.groups.map((group) => {
              const balances = split.getBalances(group);
              const total = split.totalSpent(group.id);
              const settlements = split.getSettlements(group);
              return (
                <button
                  key={group.id}
                  onClick={() => openGroup(group)}
                  className="w-full bg-white rounded-2xl border border-gray-100 p-5 hover:border-[#0d1f3c]/20 hover:shadow-sm transition-all text-left"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl w-12 h-12 flex items-center justify-center bg-gray-50 rounded-xl flex-shrink-0">
                      {group.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-extrabold text-[#0d1f3c]">{group.name}</span>
                        <span className="text-xs text-[#0d1f3c]/30">· {group.members.length} Personen</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-[#0d1f3c]/50">{fmt(total, group.currency)} gesamt</span>
                        {settlements.length > 0 && (
                          <span className="text-xs bg-amber-50 text-amber-600 font-semibold px-2 py-0.5 rounded-full">
                            {settlements.length} offene Zahlung{settlements.length > 1 ? "en" : ""}
                          </span>
                        )}
                        {settlements.length === 0 && total > 0 && (
                          <span className="text-xs bg-emerald-50 text-emerald-600 font-semibold px-2 py-0.5 rounded-full">
                            Alle quitt ✓
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex -space-x-2 flex-shrink-0">
                      {group.members.slice(0, 4).map((m, i) => (
                        <div
                          key={m.id}
                          className={`w-8 h-8 rounded-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]} border-2 border-white flex items-center justify-center text-white text-xs font-bold`}
                        >
                          {initials(m.name)}
                        </div>
                      ))}
                      {group.members.length > 4 && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-gray-500 text-xs font-bold">
                          +{group.members.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── CREATE VIEW ────────────────────────────────────────────────────────
  if (view === "create") {
    return (
      <div className="p-6 md:p-8 max-w-xl mx-auto">
        <button onClick={() => setView("list")} className="text-sm text-[#0d1f3c]/40 hover:text-[#0d1f3c] mb-6 flex items-center gap-1">
          ← Zurück
        </button>
        <h1 className="text-2xl font-extrabold text-[#0d1f3c] mb-1">Neue Gruppe</h1>
        <p className="text-[#0d1f3c]/40 text-sm mb-8">Reise, WG, Event – lege los.</p>

        <form onSubmit={handleCreateGroup} className="space-y-6">
          {/* Emoji */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <label className="block text-sm font-bold text-[#0d1f3c] mb-3">Emoji</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setNewEmoji(em)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${newEmoji === em ? "bg-[#0d1f3c] shadow-md scale-110" : "bg-gray-50 hover:bg-gray-100"}`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Name + Currency */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#0d1f3c] mb-1.5">Gruppenname</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="z.B. Barcelona Trip 🇪🇸"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#0d1f3c] mb-1.5">Hauptwährung</label>
              <select
                value={newCurrency}
                onChange={(e) => setNewCurrency(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] bg-white focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20"
              >
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Members */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <label className="block text-sm font-bold text-[#0d1f3c] mb-3">Mitglieder <span className="text-[#0d1f3c]/30 font-normal">(mind. 2)</span></label>
            <div className="space-y-2.5">
              {newMembers.map((m, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={m}
                    onChange={(e) => {
                      const next = [...newMembers];
                      next[i] = e.target.value;
                      setNewMembers(next);
                    }}
                    placeholder={`Person ${i + 1}${i === 0 ? " (du)" : ""}`}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#0d1f3c] focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20"
                  />
                  {newMembers.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setNewMembers(newMembers.filter((_, j) => j !== i))}
                      className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-colors text-lg flex items-center justify-center"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setNewMembers([...newMembers, ""])}
                className="w-full border border-dashed border-gray-200 rounded-xl py-2.5 text-sm text-[#0d1f3c]/40 hover:border-[#0d1f3c]/40 hover:text-[#0d1f3c]/60 transition-colors"
              >
                + Person hinzufügen
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#0d1f3c] text-white font-bold py-3.5 rounded-xl hover:bg-[#162d54] transition-colors"
          >
            Gruppe erstellen →
          </button>
        </form>
      </div>
    );
  }

  // ── GROUP DETAIL VIEW ──────────────────────────────────────────────────
  if (!refreshedGroup) return null;
  const group = refreshedGroup;
  const groupExps = split.groupExpenses(group.id);
  const balances = split.getBalances(group);
  const settlements = split.getSettlements(group);
  const total = split.totalSpent(group.id);

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setView("list")} className="text-sm text-[#0d1f3c]/40 hover:text-[#0d1f3c]">← Zurück</button>
        <div className="flex-1" />
        <button
          onClick={() => { if (confirm("Gruppe wirklich löschen?")) { split.deleteGroup(group.id); setView("list"); } }}
          className="text-xs text-rose-400 hover:text-rose-600 font-medium"
        >
          Löschen
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <span className="text-4xl">{group.emoji}</span>
        <div>
          <h1 className="text-2xl font-extrabold text-[#0d1f3c]">{group.name}</h1>
          <p className="text-[#0d1f3c]/40 text-sm">{group.members.length} Personen · {fmt(total, group.currency)} gesamt</p>
        </div>
        <button
          onClick={() => { setShowExpenseForm(true); setExpenseView("expenses"); }}
          className="ml-auto bg-[#0d1f3c] text-white font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-[#162d54] transition-colors"
        >
          + Ausgabe
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        {(["expenses", "balances", "settle"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setExpenseView(tab); setShowExpenseForm(false); }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${expenseView === tab ? "bg-white text-[#0d1f3c] shadow-sm" : "text-[#0d1f3c]/40 hover:text-[#0d1f3c]/60"}`}
          >
            {tab === "expenses" ? "Ausgaben" : tab === "balances" ? "Bilanzen" : "Abrechnen"}
          </button>
        ))}
      </div>

      {/* Add Expense Form */}
      {showExpenseForm && (
        <div className="bg-white rounded-2xl border border-[#0d1f3c]/10 p-5 mb-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-[#0d1f3c]">Neue Ausgabe</h3>
            <button onClick={() => setShowExpenseForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
          </div>
          <form onSubmit={handleAddExpense} className="space-y-3">
            <input
              type="text"
              value={expTitle}
              onChange={(e) => setExpTitle(e.target.value)}
              placeholder="Wofür? z.B. Abendessen, Taxi…"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#0d1f3c] focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                value={expAmount}
                onChange={(e) => setExpAmount(e.target.value)}
                placeholder="Betrag"
                min="0.01"
                step="0.01"
                required
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#0d1f3c] focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20"
              />
              <select
                value={expCurrency}
                onChange={(e) => setExpCurrency(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#0d1f3c] bg-white focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20"
              >
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0d1f3c]/50 mb-1.5 uppercase tracking-wide">Bezahlt von</label>
              <div className="flex flex-wrap gap-2">
                {group.members.map((m, i) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setExpPaidBy(m.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${expPaidBy === m.id ? "bg-[#0d1f3c] text-white" : "bg-gray-100 text-[#0d1f3c] hover:bg-gray-200"}`}
                  >
                    <span className={`inline-block w-5 h-5 rounded-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]} text-white text-xs flex items-center justify-center mr-1.5 align-middle font-bold`}>
                      {initials(m.name)}
                    </span>
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0d1f3c]/50 mb-1.5 uppercase tracking-wide">Aufteilung</label>
              <div className="flex gap-2 mb-2">
                {(["equal", "custom"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setExpSplitMode(mode)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${expSplitMode === mode ? "bg-[#0d1f3c] text-white" : "bg-gray-100 text-[#0d1f3c]"}`}
                  >
                    {mode === "equal" ? "Gleichmäßig" : "Individuell"}
                  </button>
                ))}
              </div>
              {expSplitMode === "equal" && expAmount && (
                <p className="text-xs text-[#0d1f3c]/40">
                  Jeder zahlt {fmt(parseFloat(expAmount) / group.members.length || 0, expCurrency)}
                </p>
              )}
              {expSplitMode === "custom" && (
                <div className="space-y-2 mt-2">
                  {group.members.map((m) => (
                    <div key={m.id} className="flex items-center gap-2">
                      <span className="text-sm text-[#0d1f3c] w-20 truncate">{m.name}</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={expCustomSplits[m.id] ?? ""}
                        onChange={(e) => setExpCustomSplits({ ...expCustomSplits, [m.id]: e.target.value })}
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#0d1f3c] focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-[#0d1f3c] text-white font-bold py-3 rounded-xl hover:bg-[#162d54] transition-colors text-sm"
            >
              Ausgabe hinzufügen
            </button>
          </form>
        </div>
      )}

      {/* EXPENSES TAB */}
      {expenseView === "expenses" && (
        <div className="space-y-3">
          {groupExps.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
              <div className="text-4xl mb-3">📝</div>
              <p className="text-[#0d1f3c]/40 text-sm">Noch keine Ausgaben. Füge die erste hinzu!</p>
            </div>
          ) : (
            groupExps.map((exp) => {
              const payer = group.members.find((m) => m.id === exp.paidBy);
              const payerIdx = group.members.findIndex((m) => m.id === exp.paidBy);
              return (
                <div key={exp.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full ${AVATAR_COLORS[payerIdx % AVATAR_COLORS.length]} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                    {initials(payer?.name ?? "?")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#0d1f3c] truncate">{exp.title}</p>
                    <p className="text-xs text-[#0d1f3c]/40">
                      {payer?.name} hat bezahlt · {new Date(exp.date).toLocaleDateString("de-DE", { day: "2-digit", month: "short" })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-extrabold text-[#0d1f3c]">{fmt(exp.amount, exp.currency)}</p>
                    <p className="text-xs text-[#0d1f3c]/30">÷ {exp.splits.length}</p>
                  </div>
                  <button
                    onClick={() => split.deleteExpense(exp.id)}
                    className="text-gray-300 hover:text-rose-400 transition-colors text-lg ml-1 flex-shrink-0"
                  >
                    ×
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* BALANCES TAB */}
      {expenseView === "balances" && (
        <div className="space-y-3">
          {balances.map((b, i) => (
            <div key={b.memberId} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                {initials(b.name)}
              </div>
              <div className="flex-1">
                <p className="font-bold text-[#0d1f3c]">{b.name}</p>
                <p className="text-xs text-[#0d1f3c]/40">
                  {b.balance > 0.01 ? "bekommt zurück" : b.balance < -0.01 ? "schuldet noch" : "ist quitt"}
                </p>
              </div>
              <div className={`text-right font-extrabold text-lg ${b.balance > 0.01 ? "text-emerald-500" : b.balance < -0.01 ? "text-rose-500" : "text-gray-300"}`}>
                {b.balance > 0.01 ? "+" : ""}{fmt(b.balance, group.currency)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SETTLE TAB */}
      {expenseView === "settle" && (
        <div className="space-y-4">
          {settlements.length === 0 ? (
            <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-10 text-center">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="font-extrabold text-emerald-700 mb-1">Alle quitt!</h3>
              <p className="text-emerald-600/70 text-sm">Keine offenen Schulden in dieser Gruppe.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-[#0d1f3c]/40 mb-4">
                Unser Algorithmus hat die Überweisungen minimiert – nur <strong className="text-[#0d1f3c]/60">{settlements.length} Zahlung{settlements.length > 1 ? "en" : ""}</strong> nötig, um alle Schulden zu begleichen.
              </p>
              {settlements.map((s, i) => {
                const fromIdx = group.members.findIndex((m) => m.id === s.from);
                const toIdx = group.members.findIndex((m) => m.id === s.to);
                return (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${AVATAR_COLORS[fromIdx % AVATAR_COLORS.length]} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                        {initials(s.fromName)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-[#0d1f3c]/60">
                          <strong className="text-[#0d1f3c]">{s.fromName}</strong> zahlt an <strong className="text-[#0d1f3c]">{s.toName}</strong>
                        </p>
                        <p className="text-2xl font-extrabold text-[#0d1f3c] mt-0.5">{fmt(s.amount, group.currency)}</p>
                      </div>
                      <div className={`w-10 h-10 rounded-full ${AVATAR_COLORS[toIdx % AVATAR_COLORS.length]} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                        {initials(s.toName)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <div className={`h-2 rounded-full flex-1 ${AVATAR_COLORS[fromIdx % AVATAR_COLORS.length]} opacity-30`} />
                      <span className="text-xs text-[#0d1f3c]/30">→</span>
                      <div className={`h-2 rounded-full flex-1 ${AVATAR_COLORS[toIdx % AVATAR_COLORS.length]} opacity-30`} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* QR Share */}
          <QRShare group={group} settlements={settlements} />
        </div>
      )}
    </div>
  );
}

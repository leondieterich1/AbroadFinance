"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  ClipboardList, Landmark, GraduationCap, Home, FileText,
  Lightbulb, PartyPopper, Flame, Check, ChevronUp, ChevronDown, Plus, X,
  type LucideIcon,
} from "lucide-react";

type CheckItem = { id: string; label: string; hint?: string; link?: string; custom?: boolean };
type SectionDef = { id: string; icon: LucideIcon; color: string; itemIds: string[] };
type Section = { id: string; title: string; icon: LucideIcon; color: string; items: CheckItem[] };

const SECTION_DEFS: SectionDef[] = [
  {
    id: "pre", icon: ClipboardList, color: "#0d1f3c",
    itemIds: ["passport", "visa", "insurance", "ehic", "liability", "deregister", "gez", "taxid", "vaccinations"],
  },
  {
    id: "banking", icon: Landmark, color: "#4285F4",
    itemIds: ["bank_foreign", "bank_notify", "cash", "emergency_fund", "wise", "pin", "backupcard"],
  },
  {
    id: "study", icon: GraduationCap, color: "#34A853",
    itemIds: ["bafoeg", "stipendium", "erasmus", "creditrecognition", "workvisa", "socialsecurity", "taxabroad"],
  },
  {
    id: "housing", icon: Home, color: "#FF6200",
    itemIds: ["housing", "deposit", "rentalcontract", "inventory", "internet", "registration"],
  },
  {
    id: "docs", icon: FileText, color: "#9333ea",
    itemIds: ["copies", "embassy", "emergency_contacts", "vpn", "elster", "roaming"],
  },
];

const ITEM_LINKS: Record<string, string> = {
  visa: "https://www.auswaertiges-amt.de",
  insurance: "https://www.verbraucherzentrale.de",
  ehic: "https://europa.eu/youreurope/citizens/health/unplanned-healthcare/temporary-stays/index_de.htm",
  liability: "https://www.test.de",
  taxid: "https://www.bzst.de",
  vaccinations: "https://www.auswaertiges-amt.de",
  bank_foreign: "https://www.test.de",
  emergency_fund: "https://www.verbraucherzentrale.de",
  wise: "https://www.test.de",
  bafoeg: "https://www.bafög.de",
  stipendium: "https://www.daad.de",
  erasmus: "https://www.daad.de",
  taxabroad: "https://www.bundesfinanzministerium.de",
  deposit: "https://www.verbraucherzentrale.de",
  embassy: "https://www.auswaertiges-amt.de",
  elster: "https://www.elster.de",
  gez: "https://www.rundfunkbeitrag.de",
};

export default function ChecklistPage() {
  const t = useTranslations("Checklist");
  const tSections = useTranslations("ChecklistSections");
  const tItems = useTranslations("ChecklistItems");

  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [customItems, setCustomItems] = useState<Record<string, CheckItem[]>>({});
  const [removedDefaults, setRemovedDefaults] = useState<Set<string>>(new Set());
  const [newTaskInputs, setNewTaskInputs] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(SECTION_DEFS.map((s) => s.id)));

  useEffect(() => {
    try {
      const c = localStorage.getItem("fa_checklist");
      if (c) setChecked(new Set(JSON.parse(c)));
      const ci = localStorage.getItem("fa_checklist_custom");
      if (ci) setCustomItems(JSON.parse(ci));
      const rd = localStorage.getItem("fa_checklist_removed");
      if (rd) setRemovedDefaults(new Set(JSON.parse(rd)));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("fa_checklist", JSON.stringify([...checked]));
  }, [checked, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("fa_checklist_custom", JSON.stringify(customItems));
  }, [customItems, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("fa_checklist_removed", JSON.stringify([...removedDefaults]));
  }, [removedDefaults, loaded]);

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSection(id: string) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function addCustomTask(sectionId: string) {
    const label = (newTaskInputs[sectionId] ?? "").trim();
    if (!label) return;
    const item: CheckItem = { id: `custom-${crypto.randomUUID()}`, label, custom: true };
    setCustomItems((prev) => ({ ...prev, [sectionId]: [...(prev[sectionId] ?? []), item] }));
    setNewTaskInputs((prev) => ({ ...prev, [sectionId]: "" }));
  }

  function removeItem(sectionId: string, item: CheckItem) {
    if (item.custom) {
      setCustomItems((prev) => ({
        ...prev,
        [sectionId]: (prev[sectionId] ?? []).filter((i) => i.id !== item.id),
      }));
    } else {
      setRemovedDefaults((prev) => new Set(prev).add(item.id));
    }
    setChecked((prev) => {
      const next = new Set(prev);
      next.delete(item.id);
      return next;
    });
  }

  const sections: Section[] = SECTION_DEFS.map((s) => ({
    id: s.id,
    title: tSections(s.id),
    icon: s.icon,
    color: s.color,
    items: [
      ...s.itemIds
        .filter((id) => !removedDefaults.has(id))
        .map((id) => ({
          id,
          label: tItems(`${id}.label`),
          hint: tItems(`${id}.hint`) || undefined,
          link: ITEM_LINKS[id],
        })),
      ...(customItems[s.id] ?? []),
    ],
  }));

  const totalItems = sections.reduce((s, sec) => s + sec.items.length, 0);
  const doneItems = sections.reduce((s, sec) => s + sec.items.filter((i) => checked.has(i.id)).length, 0);
  const pct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#0d1f3c]">{t("pageTitle")}</h1>
        <p className="text-[#0d1f3c]/40 text-sm mt-0.5">{t("itemsCompleted", { done: doneItems, total: totalItems })}</p>
        <p className="text-[#0d1f3c]/40 text-xs mt-2 bg-[#0d1f3c]/5 rounded-lg px-3 py-2 flex items-start gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#d97706" }} /> {t("disclaimer")}
        </p>
      </div>

      {/* Progress */}
      <div className="bg-[#0d1f3c] text-white rounded-2xl p-5 mb-6">
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">{t("progress")}</p>
            <p className="text-3xl font-extrabold">{pct}%</p>
          </div>
          <div className="opacity-40">
            {pct >= 100 ? <PartyPopper className="w-10 h-10 text-amber-300" /> : pct >= 50 ? <Flame className="w-10 h-10 text-orange-300" /> : <ClipboardList className="w-10 h-10 text-white" />}
          </div>
        </div>
        <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-white/70 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        {pct >= 100 && <p className="text-emerald-300 text-sm font-bold mt-3 flex items-center gap-1.5"><Check className="w-4 h-4" /> {t("allDone")}</p>}
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {sections.map((section) => {
          const sectionDone = section.items.filter((i) => checked.has(i.id)).length;
          const isOpen = openSections.has(section.id);
          const allDone = sectionDone === section.items.length;

          return (
            <div key={section.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <button onClick={() => toggleSection(section.id)}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50/60 transition-colors">
                <section.icon className="w-5 h-5 flex-shrink-0" style={{ color: section.color }} />
                <div className="flex-1 text-left">
                  <p className="font-extrabold text-[#0d1f3c]">{section.title}</p>
                  <p className="text-xs text-[#0d1f3c]/40">{t("sectionDone", { done: sectionDone, total: section.items.length })}</p>
                </div>
                {allDone && (
                  <span className="text-xs bg-emerald-50 text-emerald-600 font-bold px-2.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                    <Check className="w-3 h-3" /> {t("finished")}
                  </span>
                )}
                {isOpen ? <ChevronUp className="w-4 h-4 text-gray-300" /> : <ChevronDown className="w-4 h-4 text-gray-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-gray-50 divide-y divide-gray-50">
                  {section.items.map((item) => {
                    const done = checked.has(item.id);
                    return (
                      <label key={item.id} className="flex items-start gap-3 px-5 py-3.5 cursor-pointer hover:bg-gray-50/40 transition-colors">
                        <div className="flex-shrink-0 mt-0.5">
                          <input type="checkbox" checked={done} onChange={() => toggle(item.id)} className="sr-only" />
                          <div onClick={() => toggle(item.id)}
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${done ? "border-transparent" : "border-gray-200 bg-white"}`}
                            style={done ? { background: section.color } : {}}>
                            {done && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold transition-colors ${done ? "text-[#0d1f3c]/30 line-through" : "text-[#0d1f3c]"}`}>
                            {item.label}
                          </p>
                          {item.hint && <p className="text-xs text-[#0d1f3c]/30 mt-0.5">{item.hint}</p>}
                        </div>
                        <button
                          onClick={(e) => { e.preventDefault(); removeItem(section.id, item); }}
                          className="flex-shrink-0 text-[#0d1f3c]/20 hover:text-rose-500 transition-colors"
                          title={t("delete")}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </label>
                    );
                  })}

                  {/* Add custom task */}
                  <div className="flex items-center gap-2 px-5 py-3">
                    <input
                      type="text"
                      placeholder={t("addTaskPlaceholder")}
                      value={newTaskInputs[section.id] ?? ""}
                      onChange={(e) => setNewTaskInputs((prev) => ({ ...prev, [section.id]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === "Enter") addCustomTask(section.id); }}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#0d1f3c] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20"
                    />
                    <button
                      onClick={() => addCustomTask(section.id)}
                      className="flex-shrink-0 inline-flex items-center gap-1 text-sm font-semibold text-white bg-[#0d1f3c] rounded-lg px-3 py-2 hover:bg-[#162d54] transition-colors"
                    >
                      <Plus className="w-4 h-4" /> {t("add")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-center space-x-4">
        <button onClick={() => setChecked(new Set())}
          className="text-xs text-[#0d1f3c]/20 hover:text-[#0d1f3c]/40 transition-colors">
          {t("resetChecks")}
        </button>
        {removedDefaults.size > 0 && (
          <button onClick={() => setRemovedDefaults(new Set())}
            className="text-xs text-[#0d1f3c]/20 hover:text-[#0d1f3c]/40 transition-colors">
            {t("restoreRemoved", { count: removedDefaults.size })}
          </button>
        )}
      </div>
    </div>
  );
}

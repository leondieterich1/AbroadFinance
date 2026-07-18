"use client";

import { useState, useEffect } from "react";

type CheckItem = { id: string; label: string; hint?: string; link?: string; custom?: boolean };
type Section = { title: string; icon: string; color: string; items: CheckItem[] };

const CHECKLIST: Section[] = [
  {
    title: "Vor der Abreise", icon: "📋", color: "#0d1f3c",
    items: [
      { id: "passport", label: "Reisepass / Ausweis gültig (mind. 6 Monate)", hint: "Viele Länder verlangen mind. 6 Monate Restgültigkeit" },
      { id: "visa", label: "Visum beantragt (falls nötig)", link: "https://www.auswaertiges-amt.de", hint: "Auswärtiges Amt: Einreise- und Visabestimmungen nach Zielland" },
      { id: "insurance", label: "Auslandskrankenversicherung abgeschlossen", link: "https://www.verbraucherzentrale.de", hint: "Verbraucherzentrale: Vergleich & Beratung zu Auslandskrankenversicherungen" },
      { id: "ehic", label: "Europäische Krankenversicherungskarte (EHIC) beantragt", hint: "Für EU-Länder, kostenlos bei deiner Krankenkasse", link: "https://europa.eu/youreurope/citizens/health/unplanned-healthcare/temporary-stays/index_de.htm" },
      { id: "liability", label: "Haftpflichtversicherung gilt im Ausland (prüfen)", link: "https://www.test.de", hint: "Stiftung Warentest: unabhängige Versicherungstests" },
      { id: "deregister", label: "Wohnsitz abmelden (bei dauerhaftem Wegzug)", hint: "Spart GEZ-Beitrag und kann steuerliche Vorteile bringen" },
      { id: "gez", label: "Rundfunkbeitrag abgemeldet", link: "https://www.rundfunkbeitrag.de" },
      { id: "taxid", label: "Steuer-ID notiert (bleibt lebenslang gültig)", link: "https://www.bzst.de", hint: "Bundeszentralamt für Steuern" },
      { id: "vaccinations", label: "Impfungen aufgefrischt (falls nötig)", link: "https://www.auswaertiges-amt.de", hint: "Auswärtiges Amt: länderspezifische Gesundheitshinweise" },
    ],
  },
  {
    title: "Banking & Geld", icon: "🏦", color: "#4285F4",
    items: [
      { id: "bank_foreign", label: "Konto mit kostenloser Auslands-VISA eröffnet", hint: "z. B. DKB oder ING", link: "https://www.test.de" },
      { id: "bank_notify", label: "Bank über Auslandsaufenthalt informiert", hint: "Verhindert Sperrung der Karte" },
      { id: "cash", label: "Etwas Bargeld in Lokalwährung besorgt", hint: "Für Ankunft und Notfälle" },
      { id: "emergency_fund", label: "Notgroschen (3 Monate Ausgaben) auf separatem Konto", link: "https://www.verbraucherzentrale.de", hint: "Verbraucherzentrale: warum und wie viel sparen" },
      { id: "wise", label: "Wise / Revolut-Karte für günstige Auslandsüberweisungen", link: "https://www.test.de", hint: "Stiftung Warentest: Geldtransfer-Anbieter im Vergleich" },
      { id: "pin", label: "PIN aller Karten auswendig gewusst (kein Foto davon!)" },
      { id: "backupcard", label: "Zweite Karte als Backup eingepackt" },
    ],
  },
  {
    title: "Studium & Arbeit", icon: "🎓", color: "#34A853",
    items: [
      { id: "bafög", label: "BAföG-Auslandsantrag gestellt (falls zutreffend)", link: "https://www.bafög.de", hint: "Offizielles BAföG-Portal mit Förderrechner" },
      { id: "stipendium", label: "Stipendien recherchiert (DAAD, Erasmus, etc.)", link: "https://www.daad.de", hint: "DAAD-Stipendiendatenbank" },
      { id: "erasmus", label: "Erasmus-Formular ausgefüllt (falls zutreffend)", link: "https://www.daad.de", hint: "DAAD: Erasmus+ Informationen" },
      { id: "creditrecognition", label: "Leistungsanerkennung mit Heimathochschule geklärt" },
      { id: "workvisa", label: "Arbeitserlaubnis geprüft (Stunden-Limits beachten)" },
      { id: "socialsecurity", label: "Sozialversicherung im Zielland recherchiert" },
      { id: "taxabroad", label: "Doppelbesteuerungsabkommen geprüft", link: "https://www.bundesfinanzministerium.de", hint: "Bundesfinanzministerium: internationales Steuerrecht" },
    ],
  },
  {
    title: "Wohnen", icon: "🏠", color: "#FF6200",
    items: [
      { id: "housing", label: "Unterkunft für die ersten Wochen gesichert" },
      { id: "deposit", label: "Mietkaution-Regeln im Zielland geprüft", link: "https://www.verbraucherzentrale.de", hint: "Verbraucherzentrale: wie viel Mietkaution zulässig ist" },
      { id: "rentalcontract", label: "Mietvertrag vollständig gelesen und verstanden" },
      { id: "inventory", label: "Übergabeprotokoll erstellt (Fotos machen!)" },
      { id: "internet", label: "Internet / SIM-Karte organisiert" },
      { id: "registration", label: "Anmeldung beim Einwohnermeldeamt (lokale Pflicht prüfen)" },
    ],
  },
  {
    title: "Dokumente & Digitales", icon: "📄", color: "#9333ea",
    items: [
      { id: "copies", label: "Alle wichtigen Dokumente digital gesichert (Cloud)", hint: "Pass, Versicherungen, Verträge" },
      { id: "embassy", label: "Deutsche Botschaft im Zielland notiert", link: "https://www.auswaertiges-amt.de", hint: "Auswärtiges Amt: Botschaften und Konsulate weltweit" },
      { id: "emergency_contacts", label: "Notfallkontakte gespeichert (Familie, Botschaft, Arzt)" },
      { id: "vpn", label: "VPN installiert (für sicheres Banking in fremden WLANs)" },
      { id: "elster", label: "ELSTER-Zugang eingerichtet (für Steuererklärung)", link: "https://www.elster.de" },
      { id: "roaming", label: "EU-Roaming aktiviert oder lokale SIM geplant" },
    ],
  },
];

export default function ChecklistPage() {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [customItems, setCustomItems] = useState<Record<string, CheckItem[]>>({});
  const [removedDefaults, setRemovedDefaults] = useState<Set<string>>(new Set());
  const [newTaskInputs, setNewTaskInputs] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(CHECKLIST.map((s) => s.title)));

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

  function toggleSection(title: string) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(title) ? next.delete(title) : next.add(title);
      return next;
    });
  }

  function addCustomTask(sectionTitle: string) {
    const label = (newTaskInputs[sectionTitle] ?? "").trim();
    if (!label) return;
    const item: CheckItem = { id: `custom-${crypto.randomUUID()}`, label, custom: true };
    setCustomItems((prev) => ({ ...prev, [sectionTitle]: [...(prev[sectionTitle] ?? []), item] }));
    setNewTaskInputs((prev) => ({ ...prev, [sectionTitle]: "" }));
  }

  function removeItem(sectionTitle: string, item: CheckItem) {
    if (item.custom) {
      setCustomItems((prev) => ({
        ...prev,
        [sectionTitle]: (prev[sectionTitle] ?? []).filter((i) => i.id !== item.id),
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

  const sections: Section[] = CHECKLIST.map((s) => ({
    ...s,
    items: [
      ...s.items.filter((i) => !removedDefaults.has(i.id)),
      ...(customItems[s.title] ?? []),
    ],
  }));

  const totalItems = sections.reduce((s, sec) => s + sec.items.length, 0);
  const doneItems = sections.reduce((s, sec) => s + sec.items.filter((i) => checked.has(i.id)).length, 0);
  const pct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#0d1f3c]">Auslands-Checkliste</h1>
        <p className="text-[#0d1f3c]/40 text-sm mt-0.5">{doneItems} von {totalItems} erledigt</p>
        <p className="text-[#0d1f3c]/40 text-xs mt-2 bg-[#0d1f3c]/5 rounded-lg px-3 py-2">
          💡 Diese Liste ist nur ein Vorschlag und erhebt keinen Anspruch auf Vollständigkeit. Ergänze unten eigene Aufgaben, die für deine Situation wichtig sind.
        </p>
      </div>

      {/* Progress */}
      <div className="bg-[#0d1f3c] text-white rounded-2xl p-5 mb-6">
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">Fortschritt</p>
            <p className="text-3xl font-extrabold">{pct}%</p>
          </div>
          <p className="text-white/20 text-5xl font-extrabold">{pct >= 100 ? "🎉" : pct >= 50 ? "💪" : "📋"}</p>
        </div>
        <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-white/70 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        {pct >= 100 && <p className="text-emerald-300 text-sm font-bold mt-3">✓ Alles erledigt — viel Erfolg im Ausland!</p>}
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {sections.map((section) => {
          const sectionDone = section.items.filter((i) => checked.has(i.id)).length;
          const isOpen = openSections.has(section.title);
          const allDone = sectionDone === section.items.length;

          return (
            <div key={section.title} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <button onClick={() => toggleSection(section.title)}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50/60 transition-colors">
                <span className="text-xl">{section.icon}</span>
                <div className="flex-1 text-left">
                  <p className="font-extrabold text-[#0d1f3c]">{section.title}</p>
                  <p className="text-xs text-[#0d1f3c]/40">{sectionDone}/{section.items.length} erledigt</p>
                </div>
                {allDone && <span className="text-xs bg-emerald-50 text-emerald-600 font-bold px-2.5 py-1 rounded-full border border-emerald-200">✓ Fertig</span>}
                <span className="text-gray-300 text-lg">{isOpen ? "↑" : "↓"}</span>
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
                            {done && <span className="text-white text-xs font-bold">✓</span>}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold transition-colors ${done ? "text-[#0d1f3c]/30 line-through" : "text-[#0d1f3c]"}`}>
                            {item.label}
                          </p>
                          {item.hint && <p className="text-xs text-[#0d1f3c]/30 mt-0.5">{item.hint}</p>}
                          {item.link && (
                            <a href={item.link} target="_blank" rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-[10px] text-blue-400 hover:text-blue-600 transition-colors font-semibold mt-0.5 inline-block">
                              Mehr erfahren →
                            </a>
                          )}
                        </div>
                        <button
                          onClick={(e) => { e.preventDefault(); removeItem(section.title, item); }}
                          className="flex-shrink-0 text-[#0d1f3c]/20 hover:text-rose-500 transition-colors text-lg leading-none"
                          title="Löschen"
                        >
                          ×
                        </button>
                      </label>
                    );
                  })}

                  {/* Add custom task */}
                  <div className="flex items-center gap-2 px-5 py-3">
                    <input
                      type="text"
                      placeholder="Eigene Aufgabe hinzufügen…"
                      value={newTaskInputs[section.title] ?? ""}
                      onChange={(e) => setNewTaskInputs((prev) => ({ ...prev, [section.title]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === "Enter") addCustomTask(section.title); }}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#0d1f3c] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20"
                    />
                    <button
                      onClick={() => addCustomTask(section.title)}
                      className="flex-shrink-0 text-sm font-semibold text-white bg-[#0d1f3c] rounded-lg px-3 py-2 hover:bg-[#162d54] transition-colors"
                    >
                      + Hinzufügen
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
          Häkchen zurücksetzen
        </button>
        {removedDefaults.size > 0 && (
          <button onClick={() => setRemovedDefaults(new Set())}
            className="text-xs text-[#0d1f3c]/20 hover:text-[#0d1f3c]/40 transition-colors">
            Gelöschte Vorschläge wiederherstellen ({removedDefaults.size})
          </button>
        )}
      </div>
    </div>
  );
}

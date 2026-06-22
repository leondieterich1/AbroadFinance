"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { CURRENCIES } from "@/lib/utils";

type Settings = {
  displayName: string;
  homeCountry: string;
  destinationCountry: string;
  homeCurrency: string;
  destinationCurrency: string;
  monthlyIncome: string;
};

const DEFAULT: Settings = {
  displayName: "",
  homeCountry: "Deutschland",
  destinationCountry: "",
  homeCurrency: "EUR",
  destinationCurrency: "USD",
  monthlyIncome: "",
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<Settings>(DEFAULT);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem("fa_settings");
      if (s) setSettings({ ...DEFAULT, ...JSON.parse(s) });
      else if (session?.user?.name) setSettings((p) => ({ ...p, displayName: session.user!.name! }));
    } catch {}
  }, [session]);

  function set(key: keyof Settings, value: string) {
    setSettings((p) => ({ ...p, [key]: value }));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    localStorage.setItem("fa_settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-extrabold text-[#0d1f3c] mb-1">Einstellungen</h1>
      <p className="text-[#0d1f3c]/40 text-sm mb-8">Passe dein Profil und deine Präferenzen an.</p>

      {/* Account info */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
        <h2 className="font-extrabold text-[#0d1f3c] mb-4">Konto</h2>
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
          <div className="w-12 h-12 rounded-full bg-[#0d1f3c] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {(session?.user?.name || session?.user?.email || "?")[0].toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-[#0d1f3c]">{session?.user?.name || "–"}</p>
            <p className="text-[#0d1f3c]/40 text-sm">{session?.user?.email}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Profile */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-extrabold text-[#0d1f3c] mb-5">Profil</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#0d1f3c] mb-1.5">Anzeigename</label>
              <input
                type="text" placeholder="Dein Name"
                value={settings.displayName} onChange={(e) => set("displayName", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#0d1f3c] mb-1.5">Heimatland</label>
                <input
                  type="text" placeholder="z.B. Deutschland"
                  value={settings.homeCountry} onChange={(e) => set("homeCountry", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0d1f3c] mb-1.5">Zielland</label>
                <input
                  type="text" placeholder="z.B. Japan"
                  value={settings.destinationCountry} onChange={(e) => set("destinationCountry", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Finance prefs */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-extrabold text-[#0d1f3c] mb-5">Finanzpräferenzen</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#0d1f3c] mb-1.5">Heimatwährung</label>
                <select
                  value={settings.homeCurrency} onChange={(e) => set("homeCurrency", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] bg-white focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20"
                >
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0d1f3c] mb-1.5">Zielwährung</label>
                <select
                  value={settings.destinationCurrency} onChange={(e) => set("destinationCurrency", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0d1f3c] bg-white focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20"
                >
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0d1f3c] mb-1.5">Monatliches Einkommen</label>
              <div className="relative">
                <input
                  type="number" placeholder="0,00" min="0" step="50"
                  value={settings.monthlyIncome} onChange={(e) => set("monthlyIncome", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-20 text-sm text-[#0d1f3c] focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#0d1f3c]/40 font-medium">
                  {settings.homeCurrency}
                </span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className={`w-full py-4 rounded-xl font-bold text-sm transition-all ${saved ? "bg-emerald-500 text-white" : "bg-[#0d1f3c] text-white hover:bg-[#162d54]"}`}
        >
          {saved ? "✓ Einstellungen gespeichert!" : "Einstellungen speichern"}
        </button>
      </form>
    </div>
  );
}

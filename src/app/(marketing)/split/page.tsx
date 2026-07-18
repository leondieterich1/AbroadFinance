import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Splittr – Gemeinsam im Ausland, fair teilen | FinanceAbroad",
  description: "Teile Ausgaben fair mit Freunden im Ausland. Multi-Währung, automatische Abrechnung, kein Stress.",
};

const DEMO_EXPENSES = [
  { who: "Leon", title: "Airbnb Barcelona", amount: "€ 240", split: "÷ 4 Personen", color: "bg-blue-50 border-blue-100" },
  { who: "Mia", title: "Flug nach Lissabon", amount: "£ 180", split: "÷ 3 Personen", color: "bg-purple-50 border-purple-100" },
  { who: "Tom", title: "Abendessen Tokio", amount: "¥ 8.400", split: "÷ 5 Personen", color: "bg-amber-50 border-amber-100" },
];

const FEATURES = [
  {
    icon: "🌍",
    title: "Jede Währung, kein Problem",
    desc: "Ausgabe in JPY, Miete in EUR, Taxi in GBP – Splittr rechnet alles fair um und teilt in eurer Gruppenswährung auf.",
  },
  {
    icon: "🧮",
    title: "Smart Settlement",
    desc: "Unser Algorithmus minimiert die Anzahl der Überweisungen. Statt 10 Transfers nur noch 3 – weniger Stress, mehr Zeit.",
  },
  {
    icon: "⚡",
    title: "Gruppe in 10 Sekunden",
    desc: "Einfach Gruppennamen eingeben, Mitglieder hinzufügen, fertig. Keine App-Installation für deine Freunde nötig.",
  },
  {
    icon: "📊",
    title: "Immer den Überblick",
    desc: "Sieh auf einen Blick, wer noch wem etwas schuldet. Kein peinliches Nachfragen mehr nach dem Urlaub.",
  },
];

const SCENARIOS = [
  { emoji: "🏠", label: "WG-Kosten", example: "Miete, Einkauf, Nebenkosten fair aufteilen" },
  { emoji: "✈️", label: "Reisegruppe", example: "Hotels, Ausflüge, Restaurants – alles in einer Gruppe" },
  { emoji: "🎓", label: "Uni-Projekte", example: "Materialkosten und Auslagen fürs Semesterprojekt" },
  { emoji: "🎉", label: "Partys & Events", example: "Wer kauft das Bier? Wer zahlt die Location?" },
];

export default function SplitPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-[#0d1f3c] text-white">
        <div className="max-w-6xl mx-auto px-5 md:px-6 pt-14 md:pt-20 pb-16 md:pb-24 grid md:grid-cols-2 gap-10 md:gap-12 items-center">
          <div>
            <span className="inline-block bg-white/10 text-white/80 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
              ✨ Neu – Splittr by FinanceAbroad
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-5 md:mb-6">
              Splitten<br />ohne Stress.
            </h1>
            <p className="text-white/60 text-lg mb-8 leading-relaxed">
              Wer hat das Airbnb bezahlt? Wer schuldet wem wie viel?<br />
              <strong className="text-white">Splittr</strong> berechnet das automatisch – in jeder Währung, für jede Gruppe.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="bg-white text-[#0d1f3c] font-bold px-6 py-3.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Kostenlos starten →
              </Link>
              <Link
                href="/login"
                className="border border-white/20 text-white/80 font-semibold px-6 py-3.5 rounded-xl hover:bg-white/10 transition-colors"
              >
                Anmelden
              </Link>
            </div>
          </div>

          {/* Demo Cards */}
          <div className="relative hidden md:block">
            <div className="space-y-3">
              {DEMO_EXPENSES.map((item, i) => (
                <div
                  key={i}
                  className={`bg-white rounded-2xl border p-4 flex items-center justify-between shadow-sm ${item.color}`}
                  style={{ transform: `translateX(${i * 8}px)` }}
                >
                  <div>
                    <p className="text-xs text-[#0d1f3c]/40 font-medium mb-0.5">{item.who} hat bezahlt</p>
                    <p className="font-bold text-[#0d1f3c]">{item.title}</p>
                    <p className="text-xs text-[#0d1f3c]/40 mt-0.5">{item.split}</p>
                  </div>
                  <span className="text-xl font-extrabold text-[#0d1f3c]">{item.amount}</span>
                </div>
              ))}

              {/* Settlement */}
              <div className="bg-emerald-500 text-white rounded-2xl p-4 shadow-lg" style={{ transform: "translateX(16px)" }}>
                <p className="text-xs font-semibold text-white/70 mb-1">🧮 Smart Settlement</p>
                <p className="font-bold text-lg">Tom zahlt Leon <span className="underline">€ 58,40</span></p>
                <p className="text-xs text-white/60 mt-0.5">Alle Schulden in 1 Überweisung beglichen</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-[#0d1f3c]/5 border-b border-[#0d1f3c]/10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-wrap justify-center gap-8 md:gap-16 text-center">
          {[
            { value: "∞", label: "Gruppen möglich" },
            { value: "20+", label: "Währungen" },
            { value: "0€", label: "Kosten" },
            { value: "< 10s", label: "Setup-Zeit" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-extrabold text-[#0d1f3c]">{s.value}</div>
              <div className="text-xs text-[#0d1f3c]/40 font-medium mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Use Cases */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <p className="text-xs font-bold uppercase tracking-widest text-[#0d1f3c]/30 text-center mb-3">Perfekt für</p>
        <h2 className="text-3xl font-extrabold text-[#0d1f3c] text-center mb-12">Jede Situation im Ausland</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SCENARIOS.map((s) => (
            <div key={s.label} className="bg-gray-50 rounded-2xl p-6 text-center hover:bg-[#0d1f3c] hover:text-white group transition-all cursor-default">
              <div className="text-4xl mb-3">{s.emoji}</div>
              <div className="font-bold text-[#0d1f3c] group-hover:text-white mb-1">{s.label}</div>
              <div className="text-xs text-[#0d1f3c]/50 group-hover:text-white/60">{s.example}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <p className="text-xs font-bold uppercase tracking-widest text-[#0d1f3c]/30 text-center mb-3">Features</p>
          <h2 className="text-3xl font-extrabold text-[#0d1f3c] text-center mb-12">Warum Splittr anders ist</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 flex gap-5">
                <span className="text-3xl flex-shrink-0">{f.icon}</span>
                <div>
                  <h3 className="font-extrabold text-[#0d1f3c] mb-1">{f.title}</h3>
                  <p className="text-sm text-[#0d1f3c]/50 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <p className="text-xs font-bold uppercase tracking-widest text-[#0d1f3c]/30 text-center mb-3">So einfach geht's</p>
        <h2 className="text-3xl font-extrabold text-[#0d1f3c] text-center mb-12">In 3 Schritten zur fairen Abrechnung</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: "01", title: "Gruppe erstellen", desc: "Gib einen Namen ein, füge deine Mitreisenden hinzu und wählt eure Hauptwährung.", icon: "👥" },
            { step: "02", title: "Ausgaben eintragen", desc: "Wer hat was bezahlt? Trag die Ausgabe ein – egal in welcher Währung.", icon: "📝" },
            { step: "03", title: "Abrechnen", desc: "Splittr zeigt dir genau, wer wem wie viel zahlen muss – mit minimalem Aufwand.", icon: "✅" },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#0d1f3c] text-white flex items-center justify-center text-2xl mx-auto mb-4">
                {s.icon}
              </div>
              <div className="text-xs font-bold text-[#0d1f3c]/20 mb-1">SCHRITT {s.step}</div>
              <h3 className="font-extrabold text-[#0d1f3c] text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-[#0d1f3c]/50">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#0d1f3c] text-white">
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <div className="text-5xl mb-6">🤝</div>
          <h2 className="text-4xl font-extrabold mb-4">Kein Stress mehr nach dem Urlaub</h2>
          <p className="text-white/50 mb-8 text-lg">Kostenlos, sofort einsatzbereit, keine App nötig für deine Freunde.</p>
          <Link
            href="/signup"
            className="inline-block bg-white text-[#0d1f3c] font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors text-lg"
          >
            Jetzt kostenlos starten →
          </Link>
        </div>
      </div>
    </div>
  );
}

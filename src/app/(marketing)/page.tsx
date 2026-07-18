import Image from "next/image";
import Link from "next/link";
import BudgetRing from "@/components/ui/BudgetRing";
import DotPattern from "@/components/ui/DotPattern";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#eef3fb] to-white">
        <DotPattern className="text-[#0d1f3c]" />
        <div className="relative max-w-6xl mx-auto px-5 md:px-8 pt-16 md:pt-24 pb-16 md:pb-20 grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-[#0d1f3c]/5 text-[#0d1f3c] text-xs font-semibold px-4 py-2 rounded-full mb-6 md:mb-8 tracking-widest uppercase">
              ✈️ Plan. Budget. Explore.
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-[#0d1f3c] leading-tight tracking-tight mb-5 md:mb-6">
              Dein Plan für dein<br />Auslandsabenteuer.
            </h1>
            <p className="text-base md:text-xl text-[#0d1f3c]/60 max-w-xl mx-auto lg:mx-0 mb-8 md:mb-10 leading-relaxed">
              Finanzen planen. Budget im Blick. Welt entdecken – FinanceAbroad hilft
              Studierenden und Expats, ihre Ausgaben im Ausland im Griff zu behalten.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start">
              <Link
                href="/signup"
                className="bg-[#0d1f3c] text-white font-semibold px-8 py-4 rounded-full text-base hover:bg-[#162d54] transition-colors shadow-lg shadow-[#0d1f3c]/20 text-center"
              >
                Starte jetzt deinen Plan →
              </Link>
              <Link
                href="#features"
                className="text-[#0d1f3c] font-semibold px-8 py-4 text-base hover:underline text-center underline-offset-4"
              >
                Mehr erfahren
              </Link>
            </div>
          </div>

          {/* Preview card */}
          <div className="hidden lg:block">
            <div className="bg-[#0d1f3c] text-white rounded-3xl p-6 shadow-2xl shadow-[#0d1f3c]/20 max-w-sm ml-auto">
              <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest mb-4">Beispiel · Dein Budget im Überblick</p>
              <div className="flex items-center gap-5">
                <div className="relative flex items-center justify-center">
                  <BudgetRing pct={65} />
                  <span className="absolute text-lg font-extrabold">65%</span>
                </div>
                <div>
                  <p className="text-white/40 text-xs">Gesamtes Budget</p>
                  <p className="font-bold mb-2">5.000 €</p>
                  <p className="text-white/40 text-xs">Verbleibend</p>
                  <p className="font-bold text-emerald-300">1.750 €</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#0d1f3c] text-white py-14">
        <div className="max-w-5xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "50+", label: "Länder unterstützt" },
            { value: "30+", label: "Währungen" },
            { value: "100%", label: "Kostenlos starten" },
            { value: "24/7", label: "Echtzeit-Kurse" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-4xl font-extrabold mb-1">{stat.value}</div>
              <div className="text-white/60 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-[#0d1f3c] mb-4">Alles was du brauchst</h2>
          <p className="text-[#0d1f3c]/60 text-lg max-w-xl mx-auto">
            Ob Auslandssemester, Work & Travel oder dauerhaftes Expat-Leben – FinanceAbroad hat dich abgedeckt.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: "🎓",
              title: "Für Studierende",
              desc: "Speziell auf Auslandssemester und Stipendien ausgerichtet. Budgets nach BAföG oder Stipendiumsbeträgen.",
            },
            {
              icon: "🌍",
              title: "International",
              desc: "Verwalte Konten in mehreren Ländern und Währungen gleichzeitig – immer aktuell.",
            },
            {
              icon: "📊",
              title: "Finanzplanung",
              desc: "Erstelle Budgets für Miete, Essen und Freizeit. Behalte deine Ausgaben mit klaren Charts im Blick.",
            },
            {
              icon: "🔒",
              title: "Sicherheit",
              desc: "Deine Daten sind Ende-zu-Ende verschlüsselt. Keine Werbung, keine Datenweitergabe.",
            },
          ].map((f) => (
            <div key={f.title} className="bg-gray-50 rounded-2xl p-6 hover:bg-[#0d1f3c]/5 transition-colors">
              <div className="w-12 h-12 rounded-full bg-[#0d1f3c] flex items-center justify-center text-xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-[#0d1f3c] text-lg mb-2">{f.title}</h3>
              <p className="text-[#0d1f3c]/60 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-gray-50 py-24">
        <div className="max-w-5xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-[#0d1f3c] mb-4">In 3 Schritten loslegen</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { step: "01", title: "Account erstellen", desc: "Kostenlos registrieren – in unter 2 Minuten." },
              { step: "02", title: "Budget einrichten", desc: "Lege dein monatliches Budget pro Kategorie fest." },
              { step: "03", title: "Ausgaben tracken", desc: "Buche Ausgaben manuell oder per Bank-Sync." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="text-6xl font-extrabold text-[#0d1f3c]/10 mb-2">{s.step}</div>
                <h3 className="font-bold text-[#0d1f3c] text-xl mb-2">{s.title}</h3>
                <p className="text-[#0d1f3c]/60">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0d1f3c] py-24 text-center text-white">
        <div className="max-w-2xl mx-auto px-8">
          <Image src="/logo-icon.png" alt="Logo" width={64} height={64} className="rounded-2xl mx-auto mb-8" />
          <h2 className="text-4xl font-extrabold mb-4">Bereit für dein Abenteuer?</h2>
          <p className="text-white/60 text-lg mb-10">
            Starte noch heute mit FinanceAbroad und behalte deine Finanzen im Ausland unter Kontrolle.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-[#0d1f3c] font-bold px-10 py-4 rounded-full text-lg hover:bg-gray-100 transition-colors"
          >
            Kostenlos registrieren
          </Link>
        </div>
      </section>
    </>
  );
}

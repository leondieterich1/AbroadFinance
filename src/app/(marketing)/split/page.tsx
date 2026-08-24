import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  Globe, Calculator, Zap, BarChart3, Home, Plane, GraduationCap, PartyPopper,
  Users, NotebookText, CheckCircle2, Sparkles, Handshake, ArrowRight,
} from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("MarketingSplit");
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
  };
}

const DEMO_EXPENSES = [
  { who: "Leon", title: "Airbnb Barcelona", amount: "€ 240", people: 4, color: "bg-blue-50 border-blue-100" },
  { who: "Mia", title: "Flug nach Lissabon", amount: "£ 180", people: 3, color: "bg-purple-50 border-purple-100" },
  { who: "Tom", title: "Abendessen Tokio", amount: "¥ 8.400", people: 5, color: "bg-amber-50 border-amber-100" },
];

export default async function SplitPage() {
  const t = await getTranslations("MarketingSplit");

  const FEATURES = [
    { icon: Globe, color: "#10b981", title: t("feature1Title"), desc: t("feature1Desc") },
    { icon: Calculator, color: "#8b5cf6", title: t("feature2Title"), desc: t("feature2Desc") },
    { icon: Zap, color: "#f59e0b", title: t("feature3Title"), desc: t("feature3Desc") },
    { icon: BarChart3, color: "#3b82f6", title: t("feature4Title"), desc: t("feature4Desc") },
  ];

  const SCENARIOS = [
    { icon: Home, color: "#f97316", label: t("scenario1Label"), example: t("scenario1Desc") },
    { icon: Plane, color: "#0ea5e9", label: t("scenario2Label"), example: t("scenario2Desc") },
    { icon: GraduationCap, color: "#8b5cf6", label: t("scenario3Label"), example: t("scenario3Desc") },
    { icon: PartyPopper, color: "#ec4899", label: t("scenario4Label"), example: t("scenario4Desc") },
  ];

  const STEPS = [
    { step: "01", title: t("step1Title"), desc: t("step1Desc"), icon: Users },
    { step: "02", title: t("step2Title"), desc: t("step2Desc"), icon: NotebookText },
    { step: "03", title: t("step3Title"), desc: t("step3Desc"), icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-[#0d1f3c] text-white">
        <div className="max-w-6xl mx-auto px-5 md:px-6 pt-14 md:pt-20 pb-16 md:pb-24 grid md:grid-cols-2 gap-10 md:gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-white/10 text-white/80 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
              <Sparkles className="w-3.5 h-3.5" /> {t("badge")}
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-5 md:mb-6">
              {t("heroTitleLine1")}<br />{t("heroTitleLine2")}
            </h1>
            <p className="text-white/60 text-lg mb-8 leading-relaxed">
              {t("heroDesc1")}<br />
              <strong className="text-white">Splittr</strong> {t("heroDesc2")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 bg-white text-[#0d1f3c] font-bold px-6 py-3.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                {t("ctaStart")} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="border border-white/20 text-white/80 font-semibold px-6 py-3.5 rounded-xl hover:bg-white/10 transition-colors"
              >
                {t("login")}
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
                    <p className="text-xs text-[#0d1f3c]/40 font-medium mb-0.5">{t("demoPaidBy", { name: item.who })}</p>
                    <p className="font-bold text-[#0d1f3c]">{item.title}</p>
                    <p className="text-xs text-[#0d1f3c]/40 mt-0.5">{t("peopleSplit", { count: item.people })}</p>
                  </div>
                  <span className="text-xl font-extrabold text-[#0d1f3c]">{item.amount}</span>
                </div>
              ))}

              {/* Settlement */}
              <div className="bg-emerald-500 text-white rounded-2xl p-4 shadow-lg" style={{ transform: "translateX(16px)" }}>
                <p className="text-xs font-semibold text-white/70 mb-1 inline-flex items-center gap-1"><Calculator className="w-3.5 h-3.5" /> {t("smartSettlement")}</p>
                <p className="font-bold text-lg">{t("demoSettlementLine")} <span className="underline">€ 58,40</span></p>
                <p className="text-xs text-white/60 mt-0.5">{t("demoSettlementDesc")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-[#0d1f3c]/5 border-b border-[#0d1f3c]/10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-wrap justify-center gap-8 md:gap-16 text-center">
          {[
            { value: "∞", label: t("statGroups") },
            { value: "20+", label: t("statCurrencies") },
            { value: "0€", label: t("statCost") },
            { value: "< 10s", label: t("statSetup") },
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
        <p className="text-xs font-bold uppercase tracking-widest text-[#0d1f3c]/30 text-center mb-3">{t("perfectFor")}</p>
        <h2 className="text-3xl font-extrabold text-[#0d1f3c] text-center mb-12">{t("everySituation")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SCENARIOS.map((s) => (
            <div key={s.label} className="bg-gray-50 rounded-2xl p-6 text-center hover:bg-[#0d1f3c] hover:text-white group transition-all cursor-default">
              <s.icon className="w-8 h-8 mb-3 mx-auto" style={{ color: s.color }} />
              <div className="font-bold text-[#0d1f3c] group-hover:text-white mb-1">{s.label}</div>
              <div className="text-xs text-[#0d1f3c]/50 group-hover:text-white/60">{s.example}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <p className="text-xs font-bold uppercase tracking-widest text-[#0d1f3c]/30 text-center mb-3">{t("featuresLabel")}</p>
          <h2 className="text-3xl font-extrabold text-[#0d1f3c] text-center mb-12">{t("whySplittr")}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 flex gap-5">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: f.color }}>
                  <f.icon className="w-5 h-5 text-white" />
                </div>
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
        <p className="text-xs font-bold uppercase tracking-widest text-[#0d1f3c]/30 text-center mb-3">{t("howItWorks")}</p>
        <h2 className="text-3xl font-extrabold text-[#0d1f3c] text-center mb-12">{t("howItWorksTitle")}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((s) => (
            <div key={s.step} className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#0d1f3c] text-white flex items-center justify-center mx-auto mb-4">
                <s.icon className="w-7 h-7" />
              </div>
              <div className="text-xs font-bold text-[#0d1f3c]/20 mb-1">{t("step", { n: s.step })}</div>
              <h3 className="font-extrabold text-[#0d1f3c] text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-[#0d1f3c]/50">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#0d1f3c] text-white">
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <Handshake className="w-12 h-12 mb-6 mx-auto text-white/80" />
          <h2 className="text-4xl font-extrabold mb-4">{t("ctaTitle")}</h2>
          <p className="text-white/50 mb-8 text-lg">{t("ctaDesc")}</p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 bg-white text-[#0d1f3c] font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors text-lg"
          >
            {t("ctaButton")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

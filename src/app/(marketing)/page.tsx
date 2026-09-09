import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import BudgetRing from "@/components/ui/BudgetRing";
import DotPattern from "@/components/ui/DotPattern";
import { Plane, ArrowRight, GraduationCap, Globe, BarChart3, Lock } from "lucide-react";

export default async function Home() {
  const t = await getTranslations("Home");

  const stats = [
    { value: "50+", label: t("statCountries") },
    { value: "30+", label: t("statCurrencies") },
    { value: "100%", label: t("statFree") },
    { value: "24/7", label: t("statRates") },
  ];

  const features = [
    { icon: GraduationCap, color: "#8b5cf6", title: t("feature1Title"), desc: t("feature1Desc") },
    { icon: Globe, color: "#10b981", title: t("feature2Title"), desc: t("feature2Desc") },
    { icon: BarChart3, color: "#3b82f6", title: t("feature3Title"), desc: t("feature3Desc") },
    { icon: Lock, color: "#f43f5e", title: t("feature4Title"), desc: t("feature4Desc") },
  ];

  const steps = [
    { step: "01", title: t("step1Title"), desc: t("step1Desc") },
    { step: "02", title: t("step2Title"), desc: t("step2Desc") },
    { step: "03", title: t("step3Title"), desc: t("step3Desc") },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#eef3fb] to-white">
        <DotPattern className="text-[#0d1f3c]" />
        <div className="relative max-w-6xl mx-auto px-5 md:px-8 pt-16 md:pt-24 pb-16 md:pb-20 grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-[#0d1f3c]/5 text-[#0d1f3c] text-xs font-semibold px-4 py-2 rounded-full mb-6 md:mb-8 tracking-widest uppercase">
              <Plane className="w-3.5 h-3.5 text-sky-500" /> {t("badge")}
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-[#0d1f3c] leading-tight tracking-tight mb-5 md:mb-6">
              {t("heroTitleLine1")}<br />{t("heroTitleLine2")}
            </h1>
            <p className="text-base md:text-xl text-[#0d1f3c]/60 max-w-xl mx-auto lg:mx-0 mb-8 md:mb-10 leading-relaxed">
              {t("heroDesc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start">
              <Link
                href="/signup"
                className="bg-[#0d1f3c] text-white font-semibold px-8 py-4 rounded-full text-base hover:bg-[#162d54] transition-colors shadow-lg shadow-[#0d1f3c]/20 text-center"
              >
                <span className="inline-flex items-center gap-1.5">{t("ctaStart")} <ArrowRight className="w-4 h-4" /></span>
              </Link>
              <Link
                href="#features"
                className="text-[#0d1f3c] font-semibold px-8 py-4 text-base hover:underline text-center underline-offset-4"
              >
                {t("ctaMore")}
              </Link>
            </div>
          </div>

          {/* Preview card */}
          <div className="hidden lg:block">
            <div className="bg-[#0d1f3c] text-white rounded-3xl p-6 shadow-2xl shadow-[#0d1f3c]/20 max-w-sm ml-auto">
              <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest mb-4">{t("previewLabel")}</p>
              <div className="flex items-center gap-5">
                <div className="relative flex items-center justify-center">
                  <BudgetRing pct={65} />
                  <span className="absolute text-lg font-extrabold">65%</span>
                </div>
                <div>
                  <p className="text-white/40 text-xs">{t("previewTotal")}</p>
                  <p className="font-bold mb-2">5.000 €</p>
                  <p className="text-white/40 text-xs">{t("previewRemaining")}</p>
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
          {stats.map((stat) => (
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
          <h2 className="text-4xl font-extrabold text-[#0d1f3c] mb-4">{t("featuresTitle")}</h2>
          <p className="text-[#0d1f3c]/60 text-lg max-w-xl mx-auto">
            {t("featuresDesc")}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-gray-50 rounded-2xl p-6 hover:bg-[#0d1f3c]/5 transition-colors">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: f.color }}>
                <f.icon className="w-5 h-5 text-white" />
              </div>
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
            <h2 className="text-4xl font-extrabold text-[#0d1f3c] mb-4">{t("howTitle")}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {steps.map((s) => (
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
          <h2 className="text-4xl font-extrabold mb-4">{t("ctaTitle")}</h2>
          <p className="text-white/60 text-lg mb-10">
            {t("ctaDesc")}
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-[#0d1f3c] font-bold px-10 py-4 rounded-full text-lg hover:bg-gray-100 transition-colors"
          >
            {t("ctaButton")}
          </Link>
        </div>
      </section>
    </>
  );
}

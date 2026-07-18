"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#how", label: "Wie es funktioniert" },
  { href: "/planner", label: "📊 Planer" },
  { href: "/converter", label: "💱 Währungen" },
  { href: "/split", label: "🤝 Splittr", badge: "NEU" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="flex items-center justify-between px-5 md:px-8 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <Image src="/logo-icon.png" alt="FinanceAbroad" width={36} height={36} className="rounded-xl" />
          <span className="text-base md:text-xl font-bold tracking-tight text-[#0d1f3c]">FinanceAbroad</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[#0d1f3c]/70">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-[#0d1f3c] transition-colors flex items-center gap-1.5 font-semibold text-[#0d1f3c]">
              {l.label}
              {l.badge && <span className="bg-[#0d1f3c] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">{l.badge}</span>}
            </Link>
          ))}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-[#0d1f3c]/70 hover:text-[#0d1f3c] px-4 py-2">Anmelden</Link>
          <Link href="/signup" className="bg-[#0d1f3c] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#162d54] transition-colors">Kostenlos starten</Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden flex flex-col gap-1.5 p-2 rounded-xl hover:bg-gray-50 transition-colors"
          aria-label="Menü"
        >
          <span className={`block w-5 h-0.5 bg-[#0d1f3c] transition-all duration-200 ${open ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-5 h-0.5 bg-[#0d1f3c] transition-all duration-200 ${open ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-[#0d1f3c] transition-all duration-200 ${open ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-5 py-4 space-y-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-3 py-3 rounded-xl text-sm font-semibold text-[#0d1f3c] hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center gap-2">{l.label}</span>
              {l.badge && <span className="bg-[#0d1f3c] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{l.badge}</span>}
            </Link>
          ))}
          <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 mt-2">
            <Link href="/login" onClick={() => setOpen(false)} className="text-center py-3 rounded-xl border border-gray-200 text-sm font-semibold text-[#0d1f3c] hover:bg-gray-50 transition-colors">Anmelden</Link>
            <Link href="/signup" onClick={() => setOpen(false)} className="text-center py-3 rounded-xl bg-[#0d1f3c] text-white text-sm font-semibold hover:bg-[#162d54] transition-colors">Kostenlos starten</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

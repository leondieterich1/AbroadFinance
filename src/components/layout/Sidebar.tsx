"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV: { href: string; icon: string; label: string; badge?: string }[] = [
  { href: "/dashboard", icon: "⊞", label: "Übersicht" },
  { href: "/dashboard/budget", icon: "📊", label: "Budget" },
  { href: "/dashboard/transactions", icon: "💸", label: "Ausgaben" },
  { href: "/dashboard/accounts", icon: "🏦", label: "Konten", badge: "NEU" },
  { href: "/dashboard/split", icon: "🤝", label: "Splittr" },
  { href: "/dashboard/converter", icon: "💱", label: "Währungen" },
  { href: "/dashboard/goals", icon: "🎯", label: "Sparziele" },
  { href: "/dashboard/subscriptions", icon: "📦", label: "Abos" },
  { href: "/dashboard/checklist", icon: "✅", label: "Checkliste" },
  { href: "/dashboard/costs", icon: "🌍", label: "Lebenskosten" },
  { href: "/dashboard/settings", icon: "⚙️", label: "Einstellungen" },
];

export default function Sidebar({ user }: { user: { name: string; email: string } }) {
  const pathname = usePathname();
  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <aside className="w-60 flex-shrink-0 bg-[#0d1f3c] flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo-icon.png" alt="Logo" width={34} height={34} className="rounded-lg" />
          <span className="text-white font-bold text-base tracking-tight">FinanceAbroad</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-white/15 text-white"
                  : "text-white/50 hover:text-white hover:bg-white/8"
              }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
              {item.badge && (
                <span className="ml-auto bg-white/20 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 pb-5 border-t border-white/10 pt-4 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user.name || "Nutzer"}</p>
            <p className="text-white/40 text-xs truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white hover:bg-white/8 transition-all"
        >
          <span className="text-base w-5 text-center">→</span>
          Abmelden
        </button>
      </div>
    </aside>
  );
}

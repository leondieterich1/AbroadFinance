"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Wallet, TrendingUp, Receipt, Landmark, Handshake, Coins,
  Target, Package, ListChecks, Globe, Newspaper, Settings, Shield, ExternalLink, LogOut,
  PiggyBank,
  type LucideIcon,
} from "lucide-react";

const NAV: { href: string; icon: LucideIcon; label: string; color: string; badge?: string; external?: boolean }[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Übersicht", color: "#60a5fa" },
  { href: "/dashboard/budget", icon: Wallet, label: "Budget", color: "#34d399" },
  { href: "/dashboard/spartipps", icon: PiggyBank, label: "Spar-Check", color: "#10b981", badge: "NEU" },
  { href: "/dashboard/analytics", icon: TrendingUp, label: "Analyse", color: "#a78bfa" },
  { href: "/dashboard/transactions", icon: Receipt, label: "Ausgaben", color: "#fb923c" },
  { href: "/dashboard/accounts", icon: Landmark, label: "Konten", color: "#38bdf8" },
  { href: "/dashboard/split", icon: Handshake, label: "Splittr", color: "#f472b6" },
  { href: "/dashboard/converter", icon: Coins, label: "Währungen", color: "#fbbf24" },
  { href: "/dashboard/goals", icon: Target, label: "Sparziele", color: "#4ade80" },
  { href: "/dashboard/subscriptions", icon: Package, label: "Abos", color: "#c084fc" },
  { href: "/dashboard/checklist", icon: ListChecks, label: "Checkliste", color: "#2dd4bf" },
  { href: "/dashboard/costs", icon: Globe, label: "Lebenskosten", color: "#22d3ee" },
  { href: "/dashboard/newsletter", icon: Newspaper, label: "Newsletter", color: "#f87171" },
  { href: "/dashboard/settings", icon: Settings, label: "Einstellungen", color: "#94a3b8" },
];

export default function Sidebar({ user }: { user: { name: string; email: string; isAdmin?: boolean } }) {
  const pathname = usePathname();
  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();

  const nav = user.isAdmin
    ? [...NAV, { href: "https://abroad-finance-admin.vercel.app", icon: Shield, label: "Admin", color: "#fbbf24", external: true }]
    : NAV;

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
        {nav.map((item) => {
          const active = pathname === item.href;
          const className = `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            active ? "bg-white/15 text-white" : "text-white/50 hover:text-white hover:bg-white/8"
          }`;
          const content = (
            <>
              <item.icon
                className={`w-[18px] h-[18px] flex-shrink-0 transition-opacity ${active ? "opacity-100" : "opacity-60 group-hover:opacity-90"}`}
                style={{ color: item.color }}
              />
              {item.label}
              {item.badge && (
                <span className="ml-auto bg-white/20 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {item.badge}
                </span>
              )}
              {item.external && <ExternalLink className="ml-auto w-3.5 h-3.5 text-white/30" />}
            </>
          );
          return item.external ? (
            <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
              {content}
            </a>
          ) : (
            <Link key={item.href} href={item.href} className={className}>
              {content}
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
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          Abmelden
        </button>
      </div>
    </aside>
  );
}

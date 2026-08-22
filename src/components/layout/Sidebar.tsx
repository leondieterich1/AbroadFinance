"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Wallet, TrendingUp, Receipt, Landmark, Handshake, Coins,
  Target, Package, ListChecks, Globe, Newspaper, Settings, Shield, ExternalLink, LogOut,
  type LucideIcon,
} from "lucide-react";

const NAV: { href: string; icon: LucideIcon; label: string; badge?: string; external?: boolean }[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Übersicht" },
  { href: "/dashboard/budget", icon: Wallet, label: "Budget" },
  { href: "/dashboard/analytics", icon: TrendingUp, label: "Analyse", badge: "NEU" },
  { href: "/dashboard/transactions", icon: Receipt, label: "Ausgaben" },
  { href: "/dashboard/accounts", icon: Landmark, label: "Konten" },
  { href: "/dashboard/split", icon: Handshake, label: "Splittr" },
  { href: "/dashboard/converter", icon: Coins, label: "Währungen" },
  { href: "/dashboard/goals", icon: Target, label: "Sparziele" },
  { href: "/dashboard/subscriptions", icon: Package, label: "Abos" },
  { href: "/dashboard/checklist", icon: ListChecks, label: "Checkliste" },
  { href: "/dashboard/costs", icon: Globe, label: "Lebenskosten" },
  { href: "/dashboard/newsletter", icon: Newspaper, label: "Newsletter" },
  { href: "/dashboard/settings", icon: Settings, label: "Einstellungen" },
];

export default function Sidebar({ user }: { user: { name: string; email: string; isAdmin?: boolean } }) {
  const pathname = usePathname();
  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();

  const nav = user.isAdmin
    ? [...NAV, { href: "https://abroad-finance-admin.vercel.app", icon: Shield, label: "Admin", external: true }]
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
          const className = `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            active ? "bg-white/15 text-white" : "text-white/50 hover:text-white hover:bg-white/8"
          }`;
          const content = (
            <>
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
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

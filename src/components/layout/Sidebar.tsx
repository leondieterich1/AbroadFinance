"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Wallet, TrendingUp, Receipt, Landmark, Handshake, Coins,
  Target, Package, ListChecks, Settings, Shield, ExternalLink, LogOut,
  PiggyBank, ChevronsLeft, ChevronsRight,
  type LucideIcon,
} from "lucide-react";

const COLLAPSE_KEY = "sidebarCollapsed";

export default function Sidebar({ user }: { user: { name: string; email: string; isAdmin?: boolean } }) {
  const pathname = usePathname();
  const t = useTranslations("Sidebar");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      // ignore
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  }
  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();

  const NAV: { href: string; icon: LucideIcon; label: string; color: string; badge?: string; external?: boolean }[] = [
    { href: "/dashboard", icon: LayoutDashboard, label: t("overview"), color: "#60a5fa" },
    { href: "/dashboard/budget", icon: Wallet, label: t("budget"), color: "#34d399" },
    { href: "/dashboard/spartipps", icon: PiggyBank, label: t("sparCheck"), color: "#10b981", badge: t("new") },
    { href: "/dashboard/analytics", icon: TrendingUp, label: t("analytics"), color: "#a78bfa" },
    { href: "/dashboard/transactions", icon: Receipt, label: t("transactions"), color: "#fb923c" },
    { href: "/dashboard/accounts", icon: Landmark, label: t("accounts"), color: "#38bdf8" },
    { href: "/dashboard/split", icon: Handshake, label: t("splittr"), color: "#f472b6" },
    { href: "/dashboard/converter", icon: Coins, label: t("converter"), color: "#fbbf24" },
    { href: "/dashboard/goals", icon: Target, label: t("goals"), color: "#4ade80" },
    { href: "/dashboard/subscriptions", icon: Package, label: t("subscriptions"), color: "#c084fc" },
    { href: "/dashboard/checklist", icon: ListChecks, label: t("checklist"), color: "#2dd4bf" },
    { href: "/dashboard/settings", icon: Settings, label: t("settings"), color: "#94a3b8" },
  ];

  const nav = user.isAdmin
    ? [...NAV, { href: "https://abroad-finance-admin.vercel.app", icon: Shield, label: t("admin"), color: "#fbbf24", external: true }]
    : NAV;

  return (
    <aside
      className={`${collapsed ? "w-[76px]" : "w-60"} flex-shrink-0 bg-[#0d1f3c] flex flex-col min-h-screen transition-[width] duration-200 relative`}
    >
      {/* Collapse toggle */}
      <button
        onClick={toggleCollapsed}
        aria-label={collapsed ? t("expand") : t("collapse")}
        title={collapsed ? t("expand") : t("collapse")}
        className="absolute -right-3 top-7 w-6 h-6 rounded-full bg-[#0d1f3c] border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-[#162d54] transition-colors z-10"
      >
        {collapsed ? <ChevronsRight className="w-3.5 h-3.5" /> : <ChevronsLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
          <Image src="/logo-icon.png" alt="Logo" width={34} height={34} className="rounded-lg flex-shrink-0" />
          {!collapsed && <span className="text-white font-bold text-base tracking-tight whitespace-nowrap">FinanceAbroad</span>}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map((item) => {
          const active = pathname === item.href;
          const className = `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            active ? "bg-white/15 text-white" : "text-white/50 hover:text-white hover:bg-white/8"
          } ${collapsed ? "justify-center" : ""}`;
          const content = (
            <>
              <item.icon
                className={`w-[18px] h-[18px] flex-shrink-0 transition-opacity ${active ? "opacity-100" : "opacity-60 group-hover:opacity-90"}`}
                style={{ color: item.color }}
              />
              {!collapsed && (
                <>
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto bg-white/20 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                      {item.badge}
                    </span>
                  )}
                  {item.external && <ExternalLink className="ml-auto w-3.5 h-3.5 text-white/30" />}
                </>
              )}
            </>
          );
          return item.external ? (
            <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" title={collapsed ? item.label : undefined} className={className}>
              {content}
            </a>
          ) : (
            <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined} className={className}>
              {content}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 pb-5 border-t border-white/10 pt-4 space-y-2">
        <div className={`flex items-center gap-3 px-3 py-2 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user.name || t("userFallback")}</p>
              <p className="text-white/40 text-xs truncate">{user.email}</p>
            </div>
          )}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          title={collapsed ? t("logout") : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white hover:bg-white/8 transition-all ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && t("logout")}
        </button>
      </div>
    </aside>
  );
}

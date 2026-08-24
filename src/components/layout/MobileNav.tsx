"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Wallet, Receipt, Landmark, Target, ListChecks, LogOut } from "lucide-react";

const TABS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home", color: "#3b82f6" },
  { href: "/dashboard/budget", icon: Wallet, label: "Budget", color: "#10b981" },
  { href: "/dashboard/transactions", icon: Receipt, label: "Ausgaben", color: "#f97316" },
  { href: "/dashboard/accounts", icon: Landmark, label: "Konten", color: "#0ea5e9" },
  { href: "/dashboard/goals", icon: Target, label: "Ziele", color: "#22c55e" },
  { href: "/dashboard/checklist", icon: ListChecks, label: "Check", color: "#14b8a6" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-0 ${
                active ? "text-[#0d1f3c]" : "text-gray-400"
              }`}
            >
              <tab.icon
                className={`w-5 h-5 transition-transform ${active ? "scale-110" : ""}`}
                style={{ color: active ? tab.color : undefined }}
              />
              <span className={`text-[10px] font-semibold truncate ${active ? "text-[#0d1f3c]" : "text-gray-400"}`}>
                {tab.label}
              </span>
              {active && <span className="w-1 h-1 rounded-full bg-[#0d1f3c] mt-0.5" />}
            </Link>
          );
        })}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-gray-400"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Logout</span>
        </button>
      </div>
    </nav>
  );
}

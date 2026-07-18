"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const TABS = [
  { href: "/dashboard", icon: "⊞", label: "Home" },
  { href: "/dashboard/budget", icon: "📊", label: "Budget" },
  { href: "/dashboard/transactions", icon: "💸", label: "Ausgaben" },
  { href: "/dashboard/accounts", icon: "🏦", label: "Konten" },
  { href: "/dashboard/goals", icon: "🎯", label: "Ziele" },
  { href: "/dashboard/checklist", icon: "✅", label: "Check" },
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
              <span className={`text-xl leading-none transition-transform ${active ? "scale-110" : ""}`}>
                {tab.icon}
              </span>
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
          <span className="text-xl leading-none">→</span>
          <span className="text-[10px] font-semibold">Logout</span>
        </button>
      </div>
    </nav>
  );
}

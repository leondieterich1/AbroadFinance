"use client";

import { useState, type ReactNode } from "react";
import { Sparkles, Workflow } from "lucide-react";

type TabId = "features" | "how";

export default function FilterTabs({
  featuresLabel,
  howLabel,
  featuresContent,
  howContent,
}: {
  featuresLabel: string;
  howLabel: string;
  featuresContent: ReactNode;
  howContent: ReactNode;
}) {
  const [tab, setTab] = useState<TabId>("features");

  return (
    <div>
      <div className="flex justify-center gap-2 mb-12">
        {(
          [
            { id: "features" as const, label: featuresLabel, icon: Sparkles },
            { id: "how" as const, label: howLabel, icon: Workflow },
          ]
        ).map((tabDef) => (
          <button
            key={tabDef.id}
            onClick={() => setTab(tabDef.id)}
            aria-pressed={tab === tabDef.id}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
              tab === tabDef.id
                ? "bg-[#0d1f3c] text-white"
                : "bg-[#0d1f3c]/5 text-[#0d1f3c]/50 hover:text-[#0d1f3c]/80"
            }`}
          >
            <tabDef.icon className="w-4 h-4" /> {tabDef.label}
          </button>
        ))}
      </div>
      {tab === "features" ? featuresContent : howContent}
    </div>
  );
}

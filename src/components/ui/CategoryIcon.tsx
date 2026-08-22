import { CATEGORY_ICON_COMPONENTS } from "@/lib/utils";
import type { CSSProperties } from "react";

export default function CategoryIcon({
  category,
  className = "w-4 h-4",
  style,
}: {
  category: string;
  className?: string;
  style?: CSSProperties;
}) {
  const Icon = CATEGORY_ICON_COMPONENTS[category] ?? CATEGORY_ICON_COMPONENTS.sonstiges;
  return <Icon className={className} style={style} />;
}

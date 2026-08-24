import { CATEGORY_ICON_COMPONENTS, CATEGORY_COLORS } from "@/lib/utils";
import type { CSSProperties } from "react";

export default function CategoryIcon({
  category,
  className = "w-4 h-4",
  style,
  colored = true,
}: {
  category: string;
  className?: string;
  style?: CSSProperties;
  colored?: boolean;
}) {
  const Icon = CATEGORY_ICON_COMPONENTS[category] ?? CATEGORY_ICON_COMPONENTS.sonstiges;
  const color = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.sonstiges;
  return <Icon className={className} style={colored ? { color, ...style } : style} />;
}

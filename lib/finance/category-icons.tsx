import {
  Baby,
  Car,
  Gamepad2,
  MoreHorizontal,
  Receipt,
  ShoppingBag,
  Tag,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Baby,
  Gamepad2,
  Receipt,
  MoreHorizontal,
  Tag,
};

export const CATEGORY_ICON_OPTIONS = Object.keys(ICON_MAP);

export function getCategoryIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Tag;
}

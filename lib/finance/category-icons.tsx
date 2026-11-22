import {
  Baby,
  Car,
  Dumbbell,
  Gamepad2,
  GraduationCap,
  HeartPulse,
  Home,
  MoreHorizontal,
  PawPrint,
  Plane,
  Receipt,
  Shirt,
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
  HeartPulse,
  Home,
  GraduationCap,
  Shirt,
  Plane,
  Dumbbell,
  PawPrint,
  MoreHorizontal,
  Tag,
};

export const CATEGORY_ICON_OPTIONS = Object.keys(ICON_MAP);

export function getCategoryIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Tag;
}

import { getCategoryIcon } from "@/lib/finance/category-icons";

export function CategoryMark({
  name,
  icon,
  color,
}: {
  name: string;
  icon: string;
  color: string;
}) {
  const Icon = getCategoryIcon(icon);

  return (
    <span className="inline-flex max-w-full items-center gap-1 text-xs text-muted-foreground">
      <Icon className="size-3.5 shrink-0" style={{ color }} aria-hidden />
      <span className="truncate">{name}</span>
    </span>
  );
}

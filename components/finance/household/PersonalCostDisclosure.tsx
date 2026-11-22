"use client";

import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

import { CategoryMark } from "@/components/finance/CategoryMark";
import { formatCurrency } from "@/lib/finance/format";
import { pl } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { HouseholdPersonalGroup } from "@/types";

interface PersonalCostDisclosureProps {
  groups: HouseholdPersonalGroup[];
  currency: string;
  framed?: boolean;
  showHeading?: boolean;
}

function GroupRow({
  group,
  currency,
}: {
  group: HouseholdPersonalGroup;
  currency: string;
}) {
  const [open, setOpen] = useState(false);
  const expandable = group.lines.length > 1;

  if (!expandable) {
    return (
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="truncate">{group.label}</span>
        <span className="shrink-0 font-medium tabular-nums">
          {formatCurrency(group.total, currency)}
        </span>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 text-left text-sm"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <ChevronDownIcon
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
            aria-hidden
          />
          <span className="truncate">{group.label}</span>
        </span>
        <span className="shrink-0 font-medium tabular-nums">
          {formatCurrency(group.total, currency)}
        </span>
      </button>
      {open ? (
        <ul className="mt-2 space-y-1.5 pl-5">
          {group.lines.map((line) => (
            <li
              key={line.id}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="min-w-0">
                <span className="block truncate text-muted-foreground">
                  {line.title}
                </span>
                {line.categoryName ? (
                  <CategoryMark
                    name={line.categoryName}
                    icon={line.categoryIcon ?? "Tag"}
                    color={line.categoryColor ?? "currentColor"}
                  />
                ) : null}
              </span>
              <span className="shrink-0 tabular-nums">
                {formatCurrency(line.amount, currency)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function PersonalCostDisclosure({
  groups,
  currency,
  framed = false,
  showHeading = false,
}: PersonalCostDisclosureProps) {
  const rows = groups ?? [];
  if (rows.length === 0) return null;

  const shell = framed
    ? "rounded-xl border border-border bg-card px-3 py-2.5"
    : "border-t border-border pt-3";

  return (
    <div className={cn("space-y-2", shell)}>
      {showHeading ? (
        <p className="text-xs font-medium text-muted-foreground">
          {pl.finance.household.personalSection}
        </p>
      ) : null}
      {rows.map((group) => (
        <GroupRow key={group.id} group={group} currency={currency} />
      ))}
    </div>
  );
}

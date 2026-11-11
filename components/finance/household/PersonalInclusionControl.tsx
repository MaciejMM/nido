"use client";

import { pl } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { PersonalInclusionMode } from "@/types";

const MODES: PersonalInclusionMode[] = ["all", "consolidated", "none"];

const labels: Record<PersonalInclusionMode, string> = {
  all: pl.finance.household.inclusionAll,
  consolidated: pl.finance.household.inclusionConsolidated,
  none: pl.finance.household.inclusionNone,
};

const hints: Record<PersonalInclusionMode, string> = {
  all: pl.finance.household.inclusionAllHint,
  consolidated: pl.finance.household.inclusionConsolidatedHint,
  none: pl.finance.household.inclusionNoneHint,
};

interface PersonalInclusionControlProps {
  value: PersonalInclusionMode;
  disabled?: boolean;
  onChange: (mode: PersonalInclusionMode) => void;
}

export function PersonalInclusionControl({
  value,
  disabled,
  onChange,
}: PersonalInclusionControlProps) {
  return (
    <div className="space-y-2">
      <div
        role="radiogroup"
        aria-label={pl.finance.household.personalSection}
        className="grid grid-cols-3 gap-2"
      >
        {MODES.map((mode) => {
          const selected = value === mode;
          return (
            <button
              key={mode}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => {
                if (!selected) onChange(mode);
              }}
              className={cn(
                "rounded-xl border px-2 py-2 text-xs font-medium leading-tight transition-colors",
                selected
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:bg-accent/50",
              )}
            >
              {labels[mode]}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">{hints[value]}</p>
    </div>
  );
}

"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { hideAmountsCookie } from "@/lib/amount-privacy";
import { pl } from "@/lib/i18n";

export function HideAmountsToggle({ initialHidden }: { initialHidden: boolean }) {
  const [hidden, setHidden] = useState(initialHidden);

  function toggle() {
    const next = !hidden;
    setHidden(next);
    document.cookie = hideAmountsCookie(next);
    if (next) {
      document.documentElement.dataset.hideAmounts = "1";
    } else {
      delete document.documentElement.dataset.hideAmounts;
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-pressed={hidden}
      aria-label={hidden ? pl.common.showAmounts : pl.common.hideAmounts}
      onClick={toggle}
    >
      {hidden ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
    </Button>
  );
}

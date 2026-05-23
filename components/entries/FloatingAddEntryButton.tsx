"use client";

import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { pl } from "@/lib/i18n";

type FloatingAddEntryButtonProps = {
  onClick: () => void;
};

export function FloatingAddEntryButton({ onClick }: FloatingAddEntryButtonProps) {
  return (
    <Button
      size="icon"
      className="fixed bottom-20 right-4 z-50 size-14 rounded-full shadow-lg md:bottom-8"
      onClick={onClick}
      aria-label={pl.entries.add}
    >
      <PlusIcon className="size-6" />
    </Button>
  );
}

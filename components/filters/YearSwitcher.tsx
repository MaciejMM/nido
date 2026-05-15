"use client";

import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useYearFilter } from "@/components/providers/year-filter-provider";
export function YearSwitcher() {
  const { year, availableYears, setYear } = useYearFilter();

  if (availableYears.length === 0) {
    return (
      <Button variant="outline" size="sm" disabled>
        {year}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="outline" size="sm" className="gap-1">
          {year}
          <ChevronDownIcon className="size-4 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableYears.map((option) => (
          <DropdownMenuItem key={option} onClick={() => setYear(option)}>
            {option}
            {option === year ? " ✓" : ""}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

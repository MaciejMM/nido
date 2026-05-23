"use client";

import { useEffect } from "react";

import { useYearFilter } from "@/components/providers/year-filter-provider";

export function HomeYearSync({ availableYears }: { availableYears: number[] }) {
  const { setAvailableYears } = useYearFilter();

  useEffect(() => {
    if (availableYears.length > 0) {
      setAvailableYears(availableYears);
    }
  }, [availableYears, setAvailableYears]);

  return null;
}

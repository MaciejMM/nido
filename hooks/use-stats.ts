"use client";

import { useCallback, useEffect, useState } from "react";

import { useYearFilter } from "@/components/providers/year-filter-provider";
import { fetchStats } from "@/lib/api-client";
import { pl } from "@/lib/i18n";
import type { StatsDto } from "@/types";

export function useStats() {
  const { year, setAvailableYears } = useYearFilter();
  const [stats, setStats] = useState<StatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStats(year);
      setStats(data);
      if (data.availableYears.length > 0) {
        setAvailableYears(data.availableYears);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : pl.common.loadStatsFailed);
    } finally {
      setLoading(false);
    }
  }, [year, setAvailableYears]);

  useEffect(() => {
    void load();
  }, [load]);

  return { stats, loading, error, refresh: load };
}

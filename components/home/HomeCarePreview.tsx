"use client";

import { HeartHandshakeIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { StatCards } from "@/components/dashboard/StatCards";
import { RecentEntries } from "@/components/dashboard/RecentEntries";
import { HomeOverviewCard } from "@/components/home/HomeOverviewCard";
import { useYearFilter } from "@/components/providers/year-filter-provider";
import { fetchEntries, fetchStats } from "@/lib/api-client";
import { pl } from "@/lib/i18n";
import type { CustodyEntryDto, StatsDto, UserDto } from "@/types";

interface HomeCarePreviewProps {
  initialYear: number;
  initialStats: StatsDto;
  initialEntries: CustodyEntryDto[];
  users: UserDto[];
}

export function HomeCarePreview({
  initialYear,
  initialStats,
  initialEntries,
  users,
}: HomeCarePreviewProps) {
  const { year, setAvailableYears } = useYearFilter();
  const [stats, setStats] = useState(initialStats);
  const [entries, setEntries] = useState(initialEntries);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (year === initialYear) {
      setStats(initialStats);
      setEntries(initialEntries);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadForYear() {
      setLoading(true);
      try {
        const [nextStats, nextEntries] = await Promise.all([
          fetchStats(year),
          fetchEntries({ year }),
        ]);
        if (cancelled) return;
        setStats(nextStats);
        setEntries(nextEntries.slice(0, 3));
        if (nextStats.availableYears.length > 0) {
          setAvailableYears(nextStats.availableYears);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadForYear();

    return () => {
      cancelled = true;
    };
  }, [year, initialYear, initialStats, initialEntries, setAvailableYears]);

  return (
    <HomeOverviewCard
      href="/care"
      title={pl.home.careSection}
      subtitle={pl.care.subtitleForYear(year)}
      icon={HeartHandshakeIcon}
    >
      <div className="space-y-4">
        <StatCards stats={stats} loading={loading} users={users} />
        <RecentEntries
          entries={entries}
          loading={loading}
          variant="embedded"
          maxItems={3}
        />
      </div>
    </HomeOverviewCard>
  );
}

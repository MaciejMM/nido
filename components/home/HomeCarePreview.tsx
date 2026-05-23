"use client";

import { HeartHandshakeIcon } from "lucide-react";

import { StatCards } from "@/components/dashboard/StatCards";
import { RecentEntries } from "@/components/dashboard/RecentEntries";
import { HomeOverviewCard } from "@/components/home/HomeOverviewCard";
import { useYearFilter } from "@/components/providers/year-filter-provider";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useEntries } from "@/hooks/use-entries";
import { useStats } from "@/hooks/use-stats";
import { pl } from "@/lib/i18n";

export function HomeCarePreview() {
  const { year } = useYearFilter();
  const { users } = useCurrentUser();
  const { stats, loading: statsLoading } = useStats();
  const { entries, loading: entriesLoading } = useEntries();

  return (
    <HomeOverviewCard
      href="/care"
      title={pl.home.careSection}
      subtitle={pl.care.subtitleForYear(year)}
      icon={HeartHandshakeIcon}
    >
      <div className="space-y-4">
        <StatCards stats={stats} loading={statsLoading} users={users} />
        <RecentEntries
          entries={entries}
          loading={entriesLoading}
          variant="embedded"
          maxItems={3}
        />
      </div>
    </HomeOverviewCard>
  );
}

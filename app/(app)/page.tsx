"use client";

import { RecentEntries } from "@/components/dashboard/RecentEntries";
import { StatCards } from "@/components/dashboard/StatCards";
import { StatsChart } from "@/components/dashboard/StatsChart";
import { useYearFilter } from "@/components/providers/year-filter-provider";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useEntries } from "@/hooks/use-entries";
import { useStats } from "@/hooks/use-stats";
import { pl } from "@/lib/i18n";

export default function DashboardPage() {
  const { year } = useYearFilter();
  const { users } = useCurrentUser();
  const { stats, loading: statsLoading } = useStats();
  const { entries, loading: entriesLoading } = useEntries();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{pl.dashboard.title}</h2>
        <p className="text-sm text-muted-foreground">
          {pl.dashboard.subtitleForYear(year)}
        </p>
      </div>

      <StatCards stats={stats} loading={statsLoading} users={users} />
      <RecentEntries entries={entries} loading={entriesLoading} />
      <StatsChart stats={stats} loading={statsLoading} users={users} />
    </div>
  );
}

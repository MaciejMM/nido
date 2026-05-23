"use client";

import { StatCards } from "@/components/dashboard/StatCards";
import { StatsChart } from "@/components/dashboard/StatsChart";
import { EntriesView } from "@/components/entries/EntriesView";
import { useYearFilter } from "@/components/providers/year-filter-provider";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useStats } from "@/hooks/use-stats";
import { pl } from "@/lib/i18n";

export function CareView() {
  const { year } = useYearFilter();
  const { users } = useCurrentUser();
  const { stats, loading: statsLoading } = useStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{pl.care.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {pl.care.subtitleForYear(year)}
        </p>
      </div>

      <StatCards stats={stats} loading={statsLoading} users={users} />
      <StatsChart stats={stats} loading={statsLoading} users={users} />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">{pl.care.daysSection}</h2>
          <p className="text-sm text-muted-foreground">{pl.entries.subtitle}</p>
        </div>
        <EntriesView embedded />
      </section>
    </div>
  );
}

import { HomeCarePreview } from "@/components/home/HomeCarePreview";
import { HomeFinancePreview } from "@/components/home/HomeFinancePreview";
import { HomeYearSync } from "@/components/home/HomeYearSync";
import type { HomePageData } from "@/lib/home/load-home-data";
import { pl } from "@/lib/i18n";

export function HomeView({
  year,
  month,
  stats,
  entries,
  dashboard,
  users,
}: HomePageData) {
  return (
    <div className="space-y-6">
      <HomeYearSync availableYears={stats.availableYears} />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{pl.home.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{pl.home.subtitle}</p>
      </div>

      <div className="space-y-4">
        <HomeCarePreview
          initialYear={year}
          initialStats={stats}
          initialEntries={entries}
          users={users}
        />
        <HomeFinancePreview
          initialYear={year}
          initialMonth={month}
          initialDashboard={dashboard}
        />
      </div>
    </div>
  );
}

import { connectMongo } from "@/lib/db";
import * as analyticsService from "@/services/finance/finance-analytics.service";
import * as entryService from "@/services/entry.service";
import * as statsService from "@/services/stats.service";
import * as userService from "@/services/user.service";
import type {
  BudgetDashboardDto,
  CustodyEntryDto,
  StatsDto,
  UserDto,
} from "@/types";

export type HomePageData = {
  year: number;
  month: number;
  stats: StatsDto;
  entries: CustodyEntryDto[];
  dashboard: BudgetDashboardDto;
  users: UserDto[];
};

export async function loadHomePageData(): Promise<HomePageData> {
  await connectMongo();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const [stats, entries, dashboard, users] = await Promise.all([
    statsService.getStats({ year }),
    entryService.listEntries({ year }),
    analyticsService.getBudgetDashboard(year, month),
    userService.getParents(),
  ]);

  return {
    year,
    month,
    stats,
    entries: entries.slice(0, 3),
    dashboard,
    users,
  };
}

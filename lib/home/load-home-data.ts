import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

import { connectMongo } from "@/lib/db";
import { buildHouseholdPlanView } from "@/lib/finance/household-summary";
import * as entryService from "@/services/entry.service";
import * as householdPlanService from "@/services/finance/household-plan.service";
import * as statsService from "@/services/stats.service";
import * as userService from "@/services/user.service";
import type {
  CustodyEntryDto,
  HouseholdPlanDto,
  StatsDto,
  UserDto,
} from "@/types";

export type HomePageData = {
  year: number;
  month: number;
  stats: StatsDto;
  entries: CustodyEntryDto[];
  household: HouseholdPlanDto;
  users: UserDto[];
};

export async function loadHomePageData(): Promise<HomePageData> {
  await connectMongo();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const { isAuthenticated, getUser } = getKindeServerSession();
  const authed = await isAuthenticated();
  const user = authed ? await getUser() : null;

  const emptyHousehold = buildHouseholdPlanView({
    year,
    month,
    personalInclusion: "consolidated",
    incomes: [],
    expenses: [],
    personalItems: [],
  });

  const [stats, entries, users, household] = await Promise.all([
    statsService.getStats({ year }),
    entryService.listEntries({ year }),
    userService.getParents(),
    user?.id
      ? householdPlanService.getHouseholdPlan(user.id, year, month)
      : Promise.resolve(emptyHousehold),
  ]);

  return {
    year,
    month,
    stats,
    entries: entries.slice(0, 3),
    household,
    users,
  };
}

import { DEFAULT_HOUSEHOLD_ID } from "@/lib/finance/constants";
import type { MonthAnalysisDto } from "@/types";

import { getAiProvider } from "./index";

export async function getMonthAnalysis(
  year: number,
  month: number,
  householdId = DEFAULT_HOUSEHOLD_ID,
): Promise<MonthAnalysisDto> {
  const provider = getAiProvider();
  return provider.analyzeMonth({ year, month, householdId });
}

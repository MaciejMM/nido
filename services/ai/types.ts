import type { AiInsight, MonthAnalysisDto } from "@/types";

export type AiProviderName = "mock" | "openai" | "claude";

export interface MonthAnalysisInput {
  year: number;
  month: number;
  householdId?: string;
}

export interface AiProvider {
  analyzeMonth(input: MonthAnalysisInput): Promise<MonthAnalysisDto>;
}

export type { AiInsight, MonthAnalysisDto };

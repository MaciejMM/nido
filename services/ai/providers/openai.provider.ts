import type { MonthAnalysisDto } from "@/types";
import { AppError } from "@/utils/errors";

import type { AiProvider, MonthAnalysisInput } from "../types";

export class OpenAiProvider implements AiProvider {
  async analyzeMonth(_input: MonthAnalysisInput): Promise<MonthAnalysisDto> {
    throw new AppError("OpenAI provider not implemented", 501, "NOT_IMPLEMENTED");
  }
}

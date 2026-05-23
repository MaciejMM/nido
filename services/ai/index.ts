import type { AiProvider, AiProviderName } from "./types";
import { ClaudeProvider } from "./providers/claude.provider";
import { MockAiProvider } from "./providers/mock.provider";
import { OpenAiProvider } from "./providers/openai.provider";

export function getAiProvider(): AiProvider {
  const name = (process.env.AI_PROVIDER ?? "mock") as AiProviderName;

  switch (name) {
    case "openai":
      return new OpenAiProvider();
    case "claude":
      return new ClaudeProvider();
    case "mock":
    default:
      return new MockAiProvider();
  }
}

export type { AiProvider, MonthAnalysisInput } from "./types";

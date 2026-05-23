"use client";

import { SparklesIcon } from "lucide-react";

import { pl } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { MonthAnalysisDto } from "@/types";
import { cn } from "@/lib/utils";

interface AiInsightCardProps {
  analysis: MonthAnalysisDto | undefined;
  loading: boolean;
}

const severityClass = {
  info: "border-border bg-card",
  warning: "border-destructive/30 bg-destructive/5",
  success: "border-primary/30 bg-primary/5",
} as const;

export function AiInsightCard({ analysis, loading }: AiInsightCardProps) {
  return (
    <Card className="rounded-xl">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <SparklesIcon className="size-4 text-primary" />
        <CardTitle className="text-base font-semibold">
          {pl.finance.ai.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading && <Skeleton className="h-20 w-full rounded-lg" />}

        {!loading && analysis && (
          <>
            <p className="text-sm text-muted-foreground">{analysis.summary}</p>
            <ul className="space-y-2">
              {analysis.insights.map((insight) => (
                <li
                  key={insight.id}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm",
                    severityClass[insight.severity],
                  )}
                >
                  <p className="font-medium">{insight.title}</p>
                  <p className="mt-0.5 text-muted-foreground">{insight.message}</p>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}

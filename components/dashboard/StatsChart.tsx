"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatMonthLabel } from "@/lib/format";
import { getParentDisplayName, pl } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { StatsDto, UserDto } from "@/types";

interface StatsChartProps {
  stats: StatsDto | null;
  loading: boolean;
  users: UserDto[];
}

export function StatsChart({ stats, loading, users }: StatsChartProps) {
  const data =
    stats?.monthlyBreakdown.map((item) => ({
      month: formatMonthLabel(item.month),
      parentA: item.parentA,
      parentB: item.parentB,
    })) ?? [];

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{pl.dashboard.monthlyBreakdown}</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        {loading && <Skeleton className="h-full w-full rounded-lg" />}

        {!loading && data.length === 0 && (
          <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {pl.dashboard.noChartData}
          </p>
        )}

        {!loading && data.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="parentA"
                name={getParentDisplayName(users, "parentA")}
                fill="var(--chart-1)"
                radius={4}
              />
              <Bar
                dataKey="parentB"
                name={getParentDisplayName(users, "parentB")}
                fill="var(--chart-2)"
                radius={4}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

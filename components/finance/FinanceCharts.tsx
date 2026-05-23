"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { CategoryLimitProgressList } from "@/components/finance/CategoryLimitProgress";
import { formatCurrency } from "@/lib/finance/format";
import { pl } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { FinanceAnalyticsDto } from "@/types";

const CHART_HEIGHT = 240;

interface FinanceChartsProps {
  analytics: FinanceAnalyticsDto | undefined;
  loading: boolean;
}

function ChartCard({
  title,
  loading,
  empty,
  children,
}: {
  title: string;
  loading: boolean;
  empty: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-60 min-h-60">
        {loading && <Skeleton className="h-full w-full rounded-lg" />}
        {!loading && empty && (
          <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {pl.finance.analytics.noData}
          </p>
        )}
        {!loading && !empty && (
          <div className="w-full min-w-0" style={{ height: CHART_HEIGHT }}>
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function FinanceCharts({ analytics, loading }: FinanceChartsProps) {
  const monthlyData =
    analytics?.monthlyTrend.map((m) => ({
      label: m.label,
      spent: m.spent,
      limit: m.limit,
    })) ?? [];

  const categoryData =
    analytics?.categoryBreakdown
      .filter((c) => c.amount > 0)
      .map((c) => ({
        name: c.categoryName,
        value: c.amount,
        color: c.color,
      })) ?? [];

  const dailyData =
    analytics?.dailySpending.map((d) => ({
      day: String(d.day),
      amount: d.amount,
    })) ?? [];

  const hasCategoryLimits = (analytics?.categoryBreakdown ?? []).some(
    (c) => c.limitAmount != null && c.limitAmount > 0,
  );

  return (
    <div className="space-y-4">
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            {pl.finance.analytics.categoryLimits}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <Skeleton className="h-24 w-full rounded-lg" />}
          {!loading && !hasCategoryLimits && (
            <p className="text-sm text-muted-foreground">
              {pl.finance.categories.limitsEmpty}
            </p>
          )}
          {!loading && hasCategoryLimits && analytics && (
            <CategoryLimitProgressList items={analytics.categoryBreakdown} />
          )}
        </CardContent>
      </Card>

      <ChartCard
        title={pl.finance.analytics.trend}
        loading={loading}
        empty={monthlyData.every((d) => d.spent === 0)}
      >
        <ResponsiveContainer width="100%" height={CHART_HEIGHT} minWidth={0}>
          <BarChart data={monthlyData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => formatCurrency(Number(v))} />
            <Bar dataKey="spent" name={pl.finance.dashboard.spent} fill="var(--chart-1)" radius={4} />
            <Bar dataKey="limit" name={pl.finance.dashboard.limit} fill="var(--chart-3)" radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title={pl.finance.analytics.byCategory}
        loading={loading}
        empty={categoryData.length === 0}
      >
        <ResponsiveContainer width="100%" height={CHART_HEIGHT} minWidth={0}>
          <PieChart>
            <Pie
              data={categoryData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
            >
              {categoryData.map((entry, i) => (
                <Cell
                  key={entry.name}
                  fill={entry.color.startsWith("var") ? `var(--chart-${(i % 5) + 1})` : entry.color}
                />
              ))}
            </Pie>
            <Tooltip formatter={(v) => formatCurrency(Number(v))} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title={pl.finance.analytics.monthly}
        loading={loading}
        empty={!analytics || analytics.totalSpent === 0}
      >
        <ResponsiveContainer width="100%" height={CHART_HEIGHT} minWidth={0}>
          <BarChart
            data={[{ label: "Miesiąc", spent: analytics?.totalSpent ?? 0 }]}
            margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip formatter={(v) => formatCurrency(Number(v))} />
            <Bar dataKey="spent" fill="var(--chart-2)" radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title={pl.finance.analytics.daily}
        loading={loading}
        empty={dailyData.length === 0}
      >
        <ResponsiveContainer width="100%" height={CHART_HEIGHT} minWidth={0}>
          <LineChart data={dailyData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => formatCurrency(Number(v))} />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="var(--chart-4)"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

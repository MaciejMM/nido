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
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { FinanceAnalyticsDto } from "@/types";

const CHART_HEIGHT = 240;
const CATEGORY_PIE_HEIGHT = 200;

function resolveChartColor(color: string, index: number): string {
  return color.startsWith("var") ? `var(--chart-${(index % 5) + 1})` : color;
}

function CategoryChartLegend({
  items,
}: {
  items: { name: string; color: string; value: number }[];
}) {
  return (
    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 pt-1" role="list">
      {items.map((entry, i) => (
        <li
          key={entry.name}
          className="flex max-w-full items-center gap-2 text-xs"
        >
          <span
            className="size-2.5 shrink-0 rounded-full ring-1 ring-foreground/10"
            style={{ backgroundColor: resolveChartColor(entry.color, i) }}
            aria-hidden
          />
          <span className="truncate font-medium text-foreground">
            {entry.name}
          </span>
          <span className="shrink-0 tabular-nums text-muted-foreground">
            {formatCurrency(entry.value)}
          </span>
        </li>
      ))}
    </ul>
  );
}

interface FinanceChartsProps {
  analytics: FinanceAnalyticsDto | undefined;
  loading: boolean;
}

function ChartCard({
  title,
  loading,
  empty,
  footer,
  chartHeight = CHART_HEIGHT,
  children,
}: {
  title: string;
  loading: boolean;
  empty: boolean;
  footer?: React.ReactNode;
  chartHeight?: number;
  children: React.ReactNode;
}) {
  const contentMinHeight = footer ? undefined : "h-60 min-h-60";

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className={contentMinHeight}>
        {loading && <Skeleton className="h-full w-full rounded-lg" />}
        {!loading && empty && (
          <p className="flex h-full min-h-60 items-center justify-center text-sm text-muted-foreground">
            {pl.finance.analytics.noData}
          </p>
        )}
        {!loading && !empty && (
          <div className={footer ? "space-y-2" : "h-full"}>
            <div className="w-full min-w-0" style={{ height: chartHeight }}>
              {children}
            </div>
            {footer}
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

  const categoriesWithLimits = (analytics?.categoryBreakdown ?? []).filter(
    (c) => c.limitAmount != null && c.limitAmount > 0,
  );
  const hasCategoryLimits = categoriesWithLimits.length > 0;
  const monthlyLimit = analytics?.limitAmount ?? 0;
  const hasMonthlyBudget = monthlyLimit > 0;
  const totalSpent = analytics?.totalSpent ?? 0;
  const monthlyOverspend = hasMonthlyBudget
    ? Math.max(0, totalSpent - monthlyLimit)
    : 0;
  const monthlyRemaining = hasMonthlyBudget ? monthlyLimit - totalSpent : 0;
  const isOverMonthlyBudget = monthlyOverspend > 0;
  const totalAvailableLimit = categoriesWithLimits.reduce(
    (sum, c) => sum + Math.max(0, c.limitAmount! - c.amount),
    0,
  );
  const showBudgetSummary = hasMonthlyBudget || hasCategoryLimits;

  return (
    <div className="space-y-4">
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            {pl.finance.analytics.categoryLimits}
          </CardTitle>
          {!loading && showBudgetSummary && (
            <CardAction className="text-right">
              <p className="text-xs text-muted-foreground">
                {hasMonthlyBudget
                  ? isOverMonthlyBudget
                    ? pl.finance.analytics.budgetOverspend
                    : pl.finance.dashboard.remaining
                  : pl.finance.analytics.totalAvailable}
              </p>
              <p
                className={`text-base font-semibold tabular-nums ${
                  isOverMonthlyBudget ? "text-destructive" : ""
                }`}
              >
                {formatCurrency(
                  hasMonthlyBudget
                    ? isOverMonthlyBudget
                      ? monthlyOverspend
                      : monthlyRemaining
                    : totalAvailableLimit,
                )}
              </p>
            </CardAction>
          )}
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
        chartHeight={CATEGORY_PIE_HEIGHT}
        footer={<CategoryChartLegend items={categoryData} />}
      >
        <ResponsiveContainer width="100%" height={CATEGORY_PIE_HEIGHT} minWidth={0}>
          <PieChart>
            <Pie
              data={categoryData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={72}
            >
              {categoryData.map((entry, i) => (
                <Cell
                  key={entry.name}
                  fill={resolveChartColor(entry.color, i)}
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

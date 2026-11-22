"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "@/lib/finance/format";
import { pl } from "@/lib/i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { HouseholdPersonalLine, HouseholdPlanDto } from "@/types";

const CHART_HEIGHT = 240;

export interface HouseholdTrendPoint {
  label: string;
  income: number;
  costs: number;
  savings: number;
}

interface FinanceChartsProps {
  plan: HouseholdPlanDto | undefined;
  trend: HouseholdTrendPoint[];
  loading: boolean;
}

function ChartCard({
  title,
  description,
  loading,
  empty,
  chartHeight = CHART_HEIGHT,
  children,
}: {
  title: string;
  description?: string;
  loading: boolean;
  empty: boolean;
  chartHeight?: number;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="h-60 min-h-60">
        {loading && <Skeleton className="h-full w-full rounded-lg" />}
        {!loading && empty && (
          <p className="flex h-full min-h-60 items-center justify-center text-sm text-muted-foreground">
            {pl.finance.analytics.noData}
          </p>
        )}
        {!loading && !empty && (
          <div className="w-full min-w-0" style={{ height: chartHeight }}>
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function personalLabel(line: HouseholdPersonalLine): string {
  if (line.title) return line.title;
  return line.source === "consolidated"
    ? pl.finance.household.consolidatedTitle
    : line.title;
}

function ShareList({
  items,
  currency,
  color,
}: {
  items: { id: string; label: string; detail?: string; amount: number }[];
  currency: string;
  color: string;
}) {
  const max = Math.max(...items.map((item) => item.amount), 0);

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const width = max > 0 ? (item.amount / max) * 100 : 0;
        return (
          <li key={item.id} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0">
                <span className="block truncate">{item.label}</span>
                {item.detail ? (
                  <span className="block truncate text-xs text-muted-foreground">
                    {item.detail}
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 tabular-nums">
                {formatCurrency(item.amount, currency)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{ width: `${width}%`, backgroundColor: color }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function LinesCard({
  title,
  hint,
  loading,
  empty,
  items,
  currency,
  color,
}: {
  title: string;
  hint: string;
  loading: boolean;
  empty: string | null;
  items: { id: string; label: string; detail?: string; amount: number }[];
  currency: string;
  color: string;
}) {
  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <CardDescription>{hint}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && <Skeleton className="h-24 w-full rounded-lg" />}
        {!loading && empty && (
          <p className="text-sm text-muted-foreground">{empty}</p>
        )}
        {!loading && !empty && (
          <ShareList items={items} currency={currency} color={color} />
        )}
      </CardContent>
    </Card>
  );
}

function Legend({
  items,
}: {
  items: { name: string; color: string }[];
}) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-2 pt-2" role="list">
      {items.map((item) => (
        <li key={item.name} className="flex items-center gap-2 text-xs">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: item.color }}
            aria-hidden
          />
          <span className="text-muted-foreground">{item.name}</span>
        </li>
      ))}
    </ul>
  );
}

export function FinanceCharts({ plan, trend, loading }: FinanceChartsProps) {
  const summary = plan?.summary;
  const currency = summary?.currency ?? "PLN";
  const hasPlan =
    (summary?.incomeCount ?? 0) + (summary?.expenseCount ?? 0) > 0 ||
    (summary?.personalExpenses ?? 0) > 0;

  const structure = summary
    ? [
        {
          key: "income",
          name: pl.finance.household.income,
          value: summary.totalIncome,
          fill: "var(--chart-2)",
        },
        {
          key: "household",
          name: pl.finance.household.householdCosts,
          value: summary.householdExpenses,
          fill: "var(--chart-1)",
        },
        {
          key: "personal",
          name: pl.finance.household.personalCosts,
          value: summary.personalExpenses,
          fill: "var(--chart-4)",
        },
        {
          key: "savings",
          name: pl.finance.household.savings,
          value: summary.savings,
          fill: summary.savings < 0 ? "var(--destructive)" : "var(--chart-3)",
        },
      ]
    : [];

  const structureEmpty = structure.every((item) => item.value === 0);
  const trendEmpty = trend.every(
    (point) => point.income === 0 && point.costs === 0 && point.savings === 0,
  );

  const incomeItems =
    plan?.incomes.map((line) => ({
      id: line.id,
      label: line.title,
      amount: line.amount,
    })) ?? [];
  const expenseItems =
    plan?.expenses.map((line) => ({
      id: line.id,
      label: line.title,
      detail: line.category?.name,
      amount: line.amount,
    })) ?? [];
  const personalItems =
    plan?.personalLines.map((line) => ({
      id: line.id,
      label: personalLabel(line),
      detail: line.source === "personal" ? line.categoryName : undefined,
      amount: line.amount,
    })) ?? [];

  const personalEmpty =
    plan?.personalInclusion === "none"
      ? pl.finance.household.inclusionNoneHint
      : personalItems.length === 0
        ? pl.finance.household.personalEmpty
        : null;

  return (
    <div className="space-y-4">
      {!loading && !hasPlan ? (
        <p className="text-sm text-muted-foreground">{pl.finance.household.noPlan}</p>
      ) : null}

      {loading || hasPlan ? (
        <>
          <ChartCard
            title={pl.finance.analytics.structure}
            loading={loading}
            empty={structureEmpty}
            chartHeight={200}
          >
            <ResponsiveContainer width="100%" height={200} minWidth={0}>
              <BarChart
                data={structure}
                layout="vertical"
                margin={{ top: 4, right: 8, left: 8, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                  horizontal={false}
                />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={88}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value), currency)}
                />
                <Bar dataKey="value" radius={4}>
                  {structure.map((entry) => (
                    <Cell key={entry.key} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <LinesCard
            title={pl.finance.household.income}
            hint={pl.finance.household.incomeHint}
            loading={loading}
            empty={incomeItems.length === 0 ? pl.finance.household.emptyIncome : null}
            items={incomeItems}
            currency={currency}
            color="var(--chart-2)"
          />
          <LinesCard
            title={pl.finance.household.expenses}
            hint={pl.finance.household.expensesHint}
            loading={loading}
            empty={
              expenseItems.length === 0 ? pl.finance.household.emptyExpenses : null
            }
            items={expenseItems}
            currency={currency}
            color="var(--chart-1)"
          />
          <LinesCard
            title={pl.finance.household.personalSection}
            hint={pl.finance.household.personalHint}
            loading={loading}
            empty={personalEmpty}
            items={personalItems}
            currency={currency}
            color="var(--chart-4)"
          />
        </>
      ) : null}

      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            {pl.finance.analytics.trend}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <Skeleton className="h-60 w-full rounded-lg" />}
          {!loading && trendEmpty && (
            <p className="flex h-60 items-center justify-center text-sm text-muted-foreground">
              {pl.finance.analytics.noData}
            </p>
          )}
          {!loading && !trendEmpty && (
            <>
              <div className="w-full min-w-0" style={{ height: CHART_HEIGHT }}>
                <ResponsiveContainer width="100%" height={CHART_HEIGHT} minWidth={0}>
                  <BarChart data={trend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value), currency)} />
                    <Bar
                      dataKey="income"
                      name={pl.finance.household.income}
                      fill="var(--chart-2)"
                      radius={4}
                    />
                    <Bar
                      dataKey="costs"
                      name={pl.finance.household.costs}
                      fill="var(--chart-1)"
                      radius={4}
                    />
                    <Bar dataKey="savings" name={pl.finance.household.savings} radius={4}>
                      {trend.map((point, index) => (
                        <Cell
                          key={`${point.label}-${index}`}
                          fill={
                            point.savings < 0 ? "var(--destructive)" : "var(--chart-3)"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <Legend
                items={[
                  { name: pl.finance.household.income, color: "var(--chart-2)" },
                  { name: pl.finance.household.costs, color: "var(--chart-1)" },
                  { name: pl.finance.household.savings, color: "var(--chart-3)" },
                ]}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

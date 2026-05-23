import { dateLocale } from "@/lib/locale";

export function formatCurrency(amount: number, currency = "PLN"): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(value / 100);
}

export function formatFinanceMonth(year: number, month: number): string {
  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat("pl-PL", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export { dateLocale };

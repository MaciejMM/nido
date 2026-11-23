import { formatCurrency } from "@/lib/finance/format";
import { cn } from "@/lib/utils";

export function Money({
  amount,
  currency = "PLN",
  className,
}: {
  amount: number;
  currency?: string;
  className?: string;
}) {
  return (
    <span className={cn("sensitive-amount", className)}>
      {formatCurrency(amount, currency)}
    </span>
  );
}

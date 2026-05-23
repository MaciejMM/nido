"use client";

interface BudgetProgressRingProps {
  percent: number;
  size?: number;
}

export function BudgetProgressRing({ percent, size = 56 }: BudgetProgressRingProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        className="stroke-muted"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        className={clamped >= 100 ? "stroke-destructive" : "stroke-primary"}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getParentDisplayName, pl } from "@/lib/i18n";
import type { StatsDto, UserDto } from "@/types";

interface StatCardsProps {
  stats: StatsDto | null;
  loading: boolean;
  users: UserDto[];
}

const cards = [
  { key: "parentA", field: "totalDaysParentA" as const },
  { key: "parentB", field: "totalDaysParentB" as const },
  { key: "combined", field: "totalDaysCombined" as const },
];

function getCardLabel(key: string, users: UserDto[]): string {
  if (key === "combined") return pl.combined;
  return getParentDisplayName(users, key as "parentA" | "parentB");
}

export function StatCards({ stats, loading, users }: StatCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {cards.map((card) => (
          <Card key={card.key} size="sm" className="min-w-0 rounded-lg">
            <CardContent className="space-y-1.5 p-3">
              <Skeleton className="h-3 w-full max-w-16" />
              <Skeleton className="h-6 w-10" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {cards.map((card) => (
        <Card
          key={card.key}
          size="sm"
          className="min-w-0 rounded-lg border-border/80 shadow-sm"
        >
          <CardContent className="p-3">
            <p className="truncate text-xs font-medium text-muted-foreground">
              {getCardLabel(card.key, users)}
            </p>
            <p className="mt-0.5 text-xl font-semibold tracking-tight text-primary">
              {stats?.[card.field] ?? 0}
              <span className="ml-0.5 text-xs font-normal text-muted-foreground">
                {pl.days}
              </span>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

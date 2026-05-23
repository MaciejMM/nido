import Link from "next/link";
import { ChevronRightIcon, type LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface HomeOverviewCardProps {
  href: string;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export function HomeOverviewCard({
  href,
  title,
  subtitle,
  icon: Icon,
  children,
  className,
}: HomeOverviewCardProps) {
  return (
    <Link href={href} className={cn("group block", className)}>
      <Card className="rounded-xl border-border/80 transition-colors hover:border-border hover:bg-accent/20 active:bg-accent/30">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base font-semibold">{title}</CardTitle>
              {subtitle ? (
                <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
            <ChevronRightIcon
              className="size-5 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground"
              aria-hidden
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0">{children}</CardContent>
      </Card>
    </Link>
  );
}

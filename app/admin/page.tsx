import Link from "next/link";
import { CalendarDaysIcon, UsersIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { connectMongo } from "@/lib/db";
import { pl } from "@/lib/i18n";
import { CustodyEntry } from "@/models/CustodyEntry";
import { User } from "@/models/User";

export default async function AdminOverviewPage() {
  await connectMongo();

  const [userCount, entryCount] = await Promise.all([
    User.countDocuments().exec(),
    CustodyEntry.countDocuments().exec(),
  ]);

  const quickLinks = [
    {
      href: "/admin/users",
      label: pl.admin.users,
      description: pl.admin.usersSubtitle,
      icon: UsersIcon,
      stat: userCount,
      statLabel: pl.admin.stats.users,
    },
    {
      href: "/admin/entries",
      label: pl.admin.entries,
      description: pl.admin.entriesSubtitle,
      icon: CalendarDaysIcon,
      stat: entryCount,
      statLabel: pl.admin.stats.entries,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{pl.admin.overview}</h2>
        <p className="text-sm text-muted-foreground">{pl.admin.overviewSubtitle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {quickLinks.map(
          ({ href, label, description, icon: Icon, stat, statLabel }) => (
            <Link key={href} href={href}>
              <Card className="h-full transition-colors hover:bg-accent/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base font-medium">{label}</CardTitle>
                  <Icon className="size-5 text-muted-foreground" />
                </CardHeader>
                <CardContent className="space-y-1">
                  <p className="text-3xl font-semibold">{stat}</p>
                  <p className="text-xs text-muted-foreground">{statLabel}</p>
                  <p className="pt-2 text-sm text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            </Link>
          ),
        )}
      </div>
    </div>
  );
}

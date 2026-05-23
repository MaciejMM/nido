"use client";

import { HomeCarePreview } from "@/components/home/HomeCarePreview";
import { HomeFinancePreview } from "@/components/home/HomeFinancePreview";
import { pl } from "@/lib/i18n";

export function HomeView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{pl.home.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{pl.home.subtitle}</p>
      </div>

      <div className="space-y-4">
        <HomeCarePreview />
        <HomeFinancePreview />
      </div>
    </div>
  );
}

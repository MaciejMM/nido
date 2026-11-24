"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";

import { QueryProvider } from "@/components/providers/query-provider";
import { YearFilterProvider } from "@/components/providers/year-filter-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { useFinanceUiStore } from "@/stores/finance-ui.store";

const Toaster = dynamic(
  () => import("@/components/ui/sonner").then((mod) => mod.Toaster),
  { ssr: false },
);

export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void useFinanceUiStore.persist.rehydrate();
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryProvider>
        <YearFilterProvider>
          {children}
          <Toaster richColors position="top-center" />
        </YearFilterProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

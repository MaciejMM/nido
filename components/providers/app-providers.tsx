"use client";

import { QueryProvider } from "@/components/providers/query-provider";
import { YearFilterProvider } from "@/components/providers/year-filter-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
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

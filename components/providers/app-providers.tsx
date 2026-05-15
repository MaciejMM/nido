"use client";

import { YearFilterProvider } from "@/components/providers/year-filter-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <YearFilterProvider>
        {children}
        <Toaster richColors position="top-center" />
      </YearFilterProvider>
    </ThemeProvider>
  );
}

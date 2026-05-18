import { AuthActions } from "@/components/auth/AuthActions";
import { YearSwitcher } from "@/components/filters/YearSwitcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { pl } from "@/lib/i18n";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/80 md:px-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight md:hidden">
          {pl.app.name}
        </h1>
        <p className="hidden text-sm text-muted-foreground md:block">
          {pl.app.tagline}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <AuthActions />
        <ThemeToggle />
        <YearSwitcher />
      </div>
    </header>
  );
}

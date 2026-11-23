import { AuthActions } from "@/components/auth/AuthActions";
import { YearSwitcher } from "@/components/filters/YearSwitcher";
import { HideAmountsToggle } from "@/components/layout/HideAmountsToggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { pl } from "@/lib/i18n";

export function Header({ hideAmounts }: { hideAmounts: boolean }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/80 md:px-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight md:hidden">
          {pl.app.name}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <HideAmountsToggle initialHidden={hideAmounts} />
        <AuthActions />
        <ThemeToggle />
        <YearSwitcher />
      </div>
    </header>
  );
}

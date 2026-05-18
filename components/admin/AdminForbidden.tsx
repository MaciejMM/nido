import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { pl } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function AdminForbidden() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {pl.admin.forbiddenTitle}
        </h1>
        <p className="text-sm text-muted-foreground">
          {pl.admin.forbiddenSubtitle}
        </p>
        <Link href="/" className={cn(buttonVariants())}>
          {pl.admin.backToApp}
        </Link>
      </div>
    </div>
  );
}

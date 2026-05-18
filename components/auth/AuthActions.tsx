import { LoginLink, LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

import { buttonVariants } from "@/components/ui/button";
import { pl } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export async function AuthActions() {
  const { isAuthenticated, getUser } = getKindeServerSession();
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    return (
      <LoginLink
        postLoginRedirectURL="/"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        {pl.auth.signIn}
      </LoginLink>
    );
  }

  const user = await getUser();
  const displayName =
    [user?.given_name, user?.family_name].filter(Boolean).join(" ") ||
    user?.email ||
    pl.auth.signedInUser;

  return (
    <div className="flex items-center gap-2">
      <span className="hidden max-w-[10rem] truncate text-sm text-muted-foreground sm:inline">
        {displayName}
      </span>
      <LogoutLink
        postLogoutRedirectURL="/api/auth/login"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        {pl.auth.signOut}
      </LogoutLink>
    </div>
  );
}

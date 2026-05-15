"use client";

import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "@/hooks/use-current-user";
import { pl } from "@/lib/i18n";

export function UserSwitcher() {
  const { users, activeUser, loading, switchUser } = useCurrentUser();

  if (loading || !activeUser) {
    return (
      <Button variant="outline" size="sm" disabled>
        {pl.common.loading}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="outline" size="sm" className="gap-1">
          {activeUser.name}
          <ChevronDownIcon className="size-4 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {users.map((user) => (
          <DropdownMenuItem
            key={user.id}
            onClick={() => void switchUser(user.id)}
          >
            {user.name}
            {user.id === activeUser.id ? " ✓" : ""}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

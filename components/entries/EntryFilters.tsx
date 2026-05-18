"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { getParentDisplayName, pl } from "@/lib/i18n";
import type { UserRole } from "@/models/User";
import type { UserDto } from "@/types";

interface EntryFiltersProps {
  value: string;
  onChange: (value: string) => void;
  users: UserDto[];
  usersLoading?: boolean;
}

function ParentTabLabel({
  users,
  role,
  loading,
}: {
  users: UserDto[];
  role: UserRole;
  loading?: boolean;
}) {
  if (loading) {
    return <Skeleton className="mx-auto h-4 w-20 max-w-full" />;
  }

  return <span className="truncate">{getParentDisplayName(users, role)}</span>;
}

export function EntryFilters({
  value,
  onChange,
  users,
  usersLoading = false,
}: EntryFiltersProps) {
  return (
    <Tabs value={value} onValueChange={onChange}>
      <TabsList className="w-full">
        <TabsTrigger value="all" className="flex-1">
          {pl.entries.all}
        </TabsTrigger>
        <TabsTrigger value="parentA" className="flex-1">
          <ParentTabLabel users={users} role="parentA" loading={usersLoading} />
        </TabsTrigger>
        <TabsTrigger value="parentB" className="flex-1">
          <ParentTabLabel users={users} role="parentB" loading={usersLoading} />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

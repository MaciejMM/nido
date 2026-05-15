"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getParentDisplayName, pl } from "@/lib/i18n";
import type { UserDto } from "@/types";

interface EntryFiltersProps {
  value: string;
  onChange: (value: string) => void;
  users: UserDto[];
}

export function EntryFilters({ value, onChange, users }: EntryFiltersProps) {
  return (
    <Tabs value={value} onValueChange={onChange}>
      <TabsList className="w-full">
        <TabsTrigger value="all" className="flex-1">
          {pl.entries.all}
        </TabsTrigger>
        <TabsTrigger value="parentA" className="flex-1">
          {getParentDisplayName(users, "parentA")}
        </TabsTrigger>
        <TabsTrigger value="parentB" className="flex-1">
          {getParentDisplayName(users, "parentB")}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

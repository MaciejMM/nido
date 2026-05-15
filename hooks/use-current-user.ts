"use client";

import { useCallback, useEffect, useState } from "react";

import { setActiveUser } from "@/app/actions/auth";
import { fetchUsers } from "@/lib/api-client";
import type { UserDto } from "@/types";

const STORAGE_KEY = "custody-active-user-id";

export function useCurrentUser() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const parents = await fetchUsers();
        setUsers(parents);

        const stored =
          typeof window !== "undefined"
            ? window.localStorage.getItem(STORAGE_KEY)
            : null;

        const defaultId =
          stored && parents.some((p) => p.id === stored)
            ? stored
            : (parents[0]?.id ?? null);

        setActiveUserId(defaultId);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const switchUser = useCallback(async (userId: string) => {
    setActiveUserId(userId);
    window.localStorage.setItem(STORAGE_KEY, userId);
    await setActiveUser(userId);
  }, []);

  const activeUser = users.find((u) => u.id === activeUserId) ?? null;

  return {
    users,
    activeUser,
    activeUserId,
    loading,
    switchUser,
  };
}

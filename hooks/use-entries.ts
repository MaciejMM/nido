"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useYearFilter } from "@/components/providers/year-filter-provider";
import {
  createEntry,
  deleteEntry,
  fetchEntries,
  updateEntry,
} from "@/lib/api-client";
import { pl } from "@/lib/i18n";
import type {
  CreateEntryInput,
  CustodyEntryDto,
  UpdateEntryInput,
} from "@/types";

export function useEntries(ownerId?: string) {
  const { year } = useYearFilter();
  const [entries, setEntries] = useState<CustodyEntryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const entriesRef = useRef(entries);
  const prevYearRef = useRef(year);
  const prevOwnerKeyRef = useRef<string | undefined>(undefined);

  entriesRef.current = entries;

  const ownerKey = ownerId ?? "__all__";

  const load = useCallback(async () => {
    const yearChanged = prevYearRef.current !== year;
    const ownerChanged = prevOwnerKeyRef.current !== ownerKey;
    prevYearRef.current = year;
    prevOwnerKeyRef.current = ownerKey;

    if (yearChanged || ownerChanged) {
      setEntries([]);
    }

    const showSkeleton =
      yearChanged || ownerChanged || entriesRef.current.length === 0;
    if (showSkeleton) {
      setLoading(true);
      setRefreshing(false);
    } else {
      setLoading(false);
      setRefreshing(true);
    }

    setError(null);
    try {
      const data = await fetchEntries({ ownerId, year });
      setEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : pl.common.loadEntriesFailed);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [ownerId, ownerKey, year]);

  useEffect(() => {
    void load();
  }, [load]);

  const addEntry = useCallback(
    async (input: CreateEntryInput) => {
      const created = await createEntry(input);
      await load();
      return created;
    },
    [load],
  );

  const editEntry = useCallback(
    async (id: string, input: UpdateEntryInput) => {
      const updated = await updateEntry(id, input);
      await load();
      return updated;
    },
    [load],
  );

  const removeEntry = useCallback(
    async (id: string) => {
      await deleteEntry(id);
      await load();
    },
    [load],
  );

  return {
    entries,
    loading,
    refreshing,
    error,
    refresh: load,
    addEntry,
    editEntry,
    removeEntry,
  };
}

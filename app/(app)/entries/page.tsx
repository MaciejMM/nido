"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EntryFilters } from "@/components/entries/EntryFilters";
import { EntryForm } from "@/components/entries/EntryForm";
import { EntryList } from "@/components/entries/EntryList";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useEntries } from "@/hooks/use-entries";
import { useStats } from "@/hooks/use-stats";
import { pl } from "@/lib/i18n";
import type {
  CreateEntryInput,
  CustodyEntryDto,
  UpdateEntryInput,
} from "@/types";

export default function EntriesPage() {
  const [filter, setFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CustodyEntryDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustodyEntryDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { users, activeUserId, loading: usersLoading } = useCurrentUser();
  const { refresh: refreshStats } = useStats();

  const ownerId = useMemo(() => {
    if (filter === "all") return undefined;
    return users.find((u) => u.role === filter)?.id;
  }, [filter, users]);

  const {
    entries,
    loading,
    refreshing,
    addEntry,
    editEntry,
    removeEntry,
  } = useEntries(ownerId);

  const handleSubmit = async (
    input: CreateEntryInput | UpdateEntryInput,
    id?: string,
  ) => {
    if (id) {
      await editEntry(id, input);
    } else {
      await addEntry(input as CreateEntryInput);
    }
    await refreshStats();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await removeEntry(deleteTarget.id);
      await refreshStats();
      toast.success(pl.entries.deleted);
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : pl.entries.deleteFailed);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{pl.entries.title}</h2>
          <p className="text-sm text-muted-foreground">
            {pl.entries.subtitle}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingEntry(null);
            setFormOpen(true);
          }}
        >
          {pl.entries.add}
        </Button>
      </div>

      <EntryFilters
        value={filter}
        onChange={setFilter}
        users={users}
        usersLoading={usersLoading}
      />

      <EntryList
        entries={entries}
        loading={loading}
        refreshing={refreshing}
        onEdit={(entry) => {
          setEditingEntry(entry);
          setFormOpen(true);
        }}
        onDelete={setDeleteTarget}
      />

      <EntryForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingEntry(null);
        }}
        users={users}
        defaultOwnerId={activeUserId}
        entry={editingEntry}
        onSubmit={handleSubmit}
      />

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{pl.entries.deleteTitle}</DialogTitle>
            <DialogDescription>
              {pl.entries.deleteDescription}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {pl.entries.cancel}
            </Button>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={() => void handleDelete()}
            >
              {deleting ? pl.entries.deleting : pl.entries.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

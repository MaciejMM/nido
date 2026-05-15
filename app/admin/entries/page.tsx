"use client";

import { useState } from "react";
import { toast } from "sonner";

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
import { fetchUsers } from "@/lib/api-client";
import { pl } from "@/lib/i18n";
import type {
  CreateEntryInput,
  CustodyEntryDto,
  UpdateEntryInput,
  UserDto,
} from "@/types";
import { useCallback, useEffect } from "react";
import {
  createEntry,
  deleteEntry,
  fetchEntries,
  updateEntry,
} from "@/lib/api-client";

export default function AdminEntriesPage() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [entries, setEntries] = useState<CustodyEntryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CustodyEntryDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustodyEntryDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [usersData, entriesData] = await Promise.all([
        fetchUsers(),
        fetchEntries(),
      ]);
      setUsers(usersData);
      setEntries(entriesData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : pl.common.loadEntriesFailed);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async (
    input: CreateEntryInput | UpdateEntryInput,
    id?: string,
  ) => {
    if (id) {
      await updateEntry(id, input);
      toast.success(pl.entries.updated);
    } else {
      await createEntry(input as CreateEntryInput);
      toast.success(pl.entries.created);
    }
    await load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteEntry(deleteTarget.id);
      toast.success(pl.entries.deleted);
      setDeleteTarget(null);
      await load();
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
          <h2 className="text-2xl font-semibold tracking-tight">
            {pl.admin.entries}
          </h2>
          <p className="text-sm text-muted-foreground">
            {pl.admin.entriesSubtitle}
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

      <EntryList
        entries={entries}
        loading={loading}
        refreshing={false}
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
        defaultOwnerId={users[0]?.id}
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
            <DialogDescription>{pl.entries.deleteDescription}</DialogDescription>
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

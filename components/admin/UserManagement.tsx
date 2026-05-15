"use client";

import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createAdminUser,
  deleteAdminUser,
  fetchAdminUsers,
  updateAdminUser,
} from "@/lib/admin-api-client";
import { getParentLabel, pl } from "@/lib/i18n";
import type { UserDto } from "@/types";
import type { UserRole } from "@/models/User";

interface UserFormState {
  name: string;
  email: string;
  role: UserRole;
}

const emptyForm: UserFormState = {
  name: "",
  email: "",
  role: "parentA",
};

export function UserManagement() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserDto | null>(null);
  const [form, setForm] = useState<UserFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminUsers();
      setUsers(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : pl.common.requestFailed);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const openCreate = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (user: UserDto) => {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, role: user.role });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error(pl.entries.fillRequired);
      return;
    }

    setSaving(true);
    try {
      if (editingUser) {
        await updateAdminUser(editingUser.id, form);
        toast.success(pl.admin.usersSection.updated);
      } else {
        await createAdminUser(form);
        toast.success(pl.admin.usersSection.created);
      }
      setFormOpen(false);
      await loadUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : pl.entries.somethingWrong);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteAdminUser(deleteTarget.id);
      toast.success(pl.admin.usersSection.deleted);
      setDeleteTarget(null);
      await loadUsers();
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
            {pl.admin.users}
          </h2>
          <p className="text-sm text-muted-foreground">
            {pl.admin.usersSubtitle}
          </p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <PlusIcon className="size-4" />
          {pl.admin.usersSection.add}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : users.length === 0 ? (
        <p className="text-sm text-muted-foreground">{pl.admin.usersSection.empty}</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium">
                  {pl.admin.usersSection.name}
                </th>
                <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">
                  {pl.admin.usersSection.email}
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  {pl.admin.usersSection.role}
                </th>
                <th className="px-4 py-3 text-right font-medium">
                  {pl.admin.usersSection.actions}
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                    {user.email}
                  </td>
                  <td className="px-4 py-3">{getParentLabel(user.role)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => openEdit(user)}
                        aria-label={pl.admin.usersSection.edit}
                      >
                        <PencilIcon className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => setDeleteTarget(user)}
                        aria-label={pl.admin.usersSection.delete}
                      >
                        <Trash2Icon className="size-3.5 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser
                ? pl.admin.usersSection.edit
                : pl.admin.usersSection.add}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="user-name">{pl.admin.usersSection.name}</Label>
              <Input
                id="user-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-email">{pl.admin.usersSection.email}</Label>
              <Input
                id="user-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{pl.admin.usersSection.role}</Label>
              <Select
                value={form.role}
                onValueChange={(value) =>
                  setForm((f) => ({ ...f, role: value as UserRole }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parentA" label={pl.parentA}>
                    {pl.parentA}
                  </SelectItem>
                  <SelectItem value="parentB" label={pl.parentB}>
                    {pl.parentB}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              {pl.admin.usersSection.cancel}
            </Button>
            <Button disabled={saving} onClick={() => void handleSave()}>
              {saving ? pl.admin.usersSection.saving : pl.admin.usersSection.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{pl.admin.usersSection.deleteTitle}</DialogTitle>
            <DialogDescription>
              {pl.admin.usersSection.deleteDescription}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {pl.admin.usersSection.cancel}
            </Button>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={() => void handleDelete()}
            >
              {deleting ? pl.admin.usersSection.deleting : pl.admin.usersSection.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

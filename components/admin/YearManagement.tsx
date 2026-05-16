"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  createAdminYear,
  deleteAdminYear,
  fetchAdminYears,
} from "@/lib/admin-api-client";
import { pl } from "@/lib/i18n";
import type { TrackingYearDto } from "@/types";

export function YearManagement() {
  const [years, setYears] = useState<TrackingYearDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [yearValue, setYearValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TrackingYearDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadYears = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminYears();
      setYears(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : pl.common.requestFailed);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadYears();
  }, [loadYears]);

  const openCreate = () => {
    setYearValue(String(new Date().getFullYear() + 1));
    setFormOpen(true);
  };

  const handleSave = async () => {
    const parsed = Number(yearValue);
    if (!Number.isInteger(parsed)) {
      toast.error(pl.entries.fillRequired);
      return;
    }

    setSaving(true);
    try {
      await createAdminYear({ value: parsed });
      toast.success(pl.admin.yearsSection.created);
      setFormOpen(false);
      await loadYears();
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
      await deleteAdminYear(deleteTarget.value);
      toast.success(pl.admin.yearsSection.deleted);
      setDeleteTarget(null);
      await loadYears();
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
          <h2 className="text-2xl font-semibold tracking-tight">{pl.admin.years}</h2>
          <p className="text-sm text-muted-foreground">{pl.admin.yearsSubtitle}</p>
          <p className="mt-2 text-sm text-muted-foreground">{pl.admin.yearsSection.hint}</p>
        </div>
        <Button onClick={openCreate} className="gap-1.5 shrink-0">
          <PlusIcon className="size-4" />
          {pl.admin.yearsSection.add}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : years.length === 0 ? (
        <p className="text-sm text-muted-foreground">{pl.admin.yearsSection.empty}</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium">
                  {pl.admin.yearsSection.year}
                </th>
                <th className="px-4 py-3 text-right font-medium">
                  {pl.admin.yearsSection.actions}
                </th>
              </tr>
            </thead>
            <tbody>
              {years.map((year) => (
                <tr key={year.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{year.value}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => setDeleteTarget(year)}
                        aria-label={pl.admin.yearsSection.delete}
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
            <DialogTitle>{pl.admin.yearsSection.add}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="year-value">{pl.admin.yearsSection.year}</Label>
              <Input
                id="year-value"
                type="number"
                min={1970}
                max={2100}
                placeholder={pl.admin.yearsSection.yearPlaceholder}
                value={yearValue}
                onChange={(e) => setYearValue(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              {pl.admin.yearsSection.cancel}
            </Button>
            <Button disabled={saving} onClick={() => void handleSave()}>
              {saving ? pl.admin.yearsSection.saving : pl.admin.yearsSection.save}
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
            <DialogTitle>{pl.admin.yearsSection.deleteTitle}</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? pl.admin.yearsSection.deleteDescription(deleteTarget.value)
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {pl.admin.yearsSection.cancel}
            </Button>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={() => void handleDelete()}
            >
              {deleting ? pl.admin.yearsSection.deleting : pl.admin.yearsSection.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

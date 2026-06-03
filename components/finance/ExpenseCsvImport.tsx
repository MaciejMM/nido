"use client";

import { useRef } from "react";
import { UploadIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useExpenseImport } from "@/hooks/finance/use-expense-import";
import { pl } from "@/lib/i18n";

interface ExpenseCsvImportProps {
  year: number;
  month: number;
}

export function ExpenseCsvImport({ year, month }: ExpenseCsvImportProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const importMutation = useExpenseImport(year, month);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      toast.error(pl.finance.expenses.importNoFile);
      return;
    }

    try {
      const result = await importMutation.mutateAsync(file);
      toast.success(
        pl.finance.expenses.importSuccess(
          result.imported,
          result.duplicatesSkipped,
          result.outOfMonthSkipped,
          result.carriedFromPreviousMonth,
        ),
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : pl.finance.expenses.importFailed,
      );
    }
  };

  return (
    <div className="w-full sm:w-auto sm:shrink-0">
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full gap-2 sm:w-auto"
        disabled={importMutation.isPending}
        onClick={() => inputRef.current?.click()}
      >
        <UploadIcon aria-hidden />
        {importMutation.isPending
          ? pl.finance.expenses.importing
          : pl.finance.expenses.importButton}
      </Button>
    </div>
  );
}

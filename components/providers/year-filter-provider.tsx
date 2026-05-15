"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "custody-selected-year";

type YearFilterContextValue = {
  year: number;
  availableYears: number[];
  setYear: (year: number) => void;
  setAvailableYears: (years: number[]) => void;
};

const YearFilterContext = createContext<YearFilterContextValue | null>(null);

function readStoredYear(): number | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  const parsed = Number(stored);
  return Number.isInteger(parsed) ? parsed : null;
}

export function YearFilterProvider({ children }: { children: React.ReactNode }) {
  const currentYear = new Date().getFullYear();
  const [year, setYearState] = useState(currentYear);
  const [availableYears, setAvailableYears] = useState<number[]>([currentYear]);

  useEffect(() => {
    const stored = readStoredYear();
    if (stored) {
      setYearState(stored);
    }
  }, []);

  const setYear = useCallback((nextYear: number) => {
    setYearState(nextYear);
    window.localStorage.setItem(STORAGE_KEY, String(nextYear));
  }, []);

  useEffect(() => {
    if (!availableYears.includes(year)) {
      setYear(availableYears[0] ?? currentYear);
    }
  }, [availableYears, year, setYear, currentYear]);

  const value = useMemo(
    () => ({ year, availableYears, setYear, setAvailableYears }),
    [year, availableYears, setYear],
  );

  return (
    <YearFilterContext.Provider value={value}>
      {children}
    </YearFilterContext.Provider>
  );
}

export function useYearFilter() {
  const context = useContext(YearFilterContext);
  if (!context) {
    throw new Error("useYearFilter must be used within YearFilterProvider");
  }
  return context;
}

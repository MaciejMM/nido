import type { UserRole } from "@/models/User";

export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface CustodyEntryDto {
  id: string;
  startDate: string;
  endDate: string;
  ownerId: string;
  owner?: UserDto;
  notes?: string;
  days: number;
  createdAt: string;
}

export interface CreateEntryInput {
  startDate: Date;
  endDate: Date;
  ownerId: string;
  notes?: string;
}

export interface UpdateEntryInput {
  startDate?: Date;
  endDate?: Date;
  ownerId?: string;
  notes?: string;
}

export interface ListEntriesFilters {
  ownerId?: string;
  year?: number;
}

export interface StatsFilters {
  year?: number;
}

export interface MonthlyBreakdownItem {
  month: string;
  parentA: number;
  parentB: number;
  total: number;
}

export interface StatsDto {
  totalDaysParentA: number;
  totalDaysParentB: number;
  totalDaysCombined: number;
  monthlyBreakdown: MonthlyBreakdownItem[];
  availableYears: number[];
}

export interface TrackingYearDto {
  id: string;
  value: number;
}

export interface ApiErrorBody {
  error: string;
  code?: string;
  details?: unknown;
}

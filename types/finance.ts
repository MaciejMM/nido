export interface ExpenseCategoryDto {
  id: string;
  name: string;
  icon: string;
  color: string;
  monthlyLimit: number | null;
  isDefault: boolean;
  createdAt: string;
}

export interface ExpenseDto {
  id: string;
  amount: number;
  title: string;
  categoryId: string;
  category?: ExpenseCategoryDto;
  date: string;
  notes?: string;
  currency: string;
  importHash?: string;
  importSource?: "mbank_csv";
  createdAt: string;
  updatedAt: string;
}

export interface ImportResult {
  imported: number;
  duplicatesSkipped: number;
  outOfMonthSkipped: number;
  invalidRows: number;
  errors?: string[];
}

export interface CreateExpenseInput {
  amount: number;
  title: string;
  categoryId: string;
  date: Date;
  notes?: string;
}

export interface UpdateExpenseInput {
  amount?: number;
  title?: string;
  categoryId?: string;
  date?: Date;
  notes?: string;
}

export interface BulkUpdateExpenseCategoryInput {
  ids: string[];
  categoryId: string;
}

export interface BulkUpdateExpenseCategoryResult {
  updated: number;
}

export interface ListExpensesFilters {
  categoryId?: string;
  month?: number;
  year?: number;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface CreateCategoryInput {
  name: string;
  icon: string;
  color: string;
  monthlyLimit?: number | null;
}

export interface UpdateCategoryInput {
  monthlyLimit?: number | null;
}

export interface MonthlyBudgetDto {
  id: string;
  year: number;
  month: number;
  limitAmount: number;
}

export interface UpsertBudgetInput {
  year: number;
  month: number;
  limitAmount: number;
}

export interface BudgetDashboardDto {
  year: number;
  month: number;
  limitAmount: number;
  spent: number;
  remaining: number;
  utilizationPercent: number;
  daysLeft: number;
  daysElapsed: number;
  daysInMonth: number;
  dailyAllowance: number;
  avgDailySpend: number;
  projectedOverspend: boolean;
  currency: string;
}

export interface CategorySpendItem {
  categoryId: string;
  categoryName: string;
  color: string;
  amount: number;
  percent: number;
  limitAmount: number | null;
  utilizationPercent: number | null;
}

export interface MonthlySpendItem {
  monthKey: string;
  label: string;
  spent: number;
  limit: number;
}

export interface DailySpendItem {
  day: number;
  amount: number;
}

export interface FinanceAnalyticsDto {
  year: number;
  month: number;
  categoryBreakdown: CategorySpendItem[];
  monthlyTrend: MonthlySpendItem[];
  dailySpending: DailySpendItem[];
  totalSpent: number;
}

export type AiInsightSeverity = "info" | "warning" | "success";

export interface AiInsight {
  id: string;
  title: string;
  message: string;
  severity: AiInsightSeverity;
}

export interface MonthAnalysisDto {
  year: number;
  month: number;
  summary: string;
  insights: AiInsight[];
}

export interface NotificationSettingsDto {
  enabled: boolean;
  reminderHour: number;
  timezone: string;
}

export interface UpdateNotificationSettingsInput {
  enabled: boolean;
  reminderHour: number;
  timezone: string;
}

export interface PushSubscribeInput {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

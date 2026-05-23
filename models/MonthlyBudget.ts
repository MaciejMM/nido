import mongoose, { type Document, Schema } from "mongoose";

export interface IMonthlyBudget extends Document {
  month: number;
  year: number;
  limitAmount: number;
  householdId: string;
  createdAt: Date;
  updatedAt: Date;
}

const monthlyBudgetSchema = new Schema<IMonthlyBudget>(
  {
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true, min: 2000, max: 2100 },
    limitAmount: { type: Number, required: true, min: 0 },
    householdId: { type: String, required: true, default: "default" },
  },
  { timestamps: true },
);

monthlyBudgetSchema.index(
  { householdId: 1, year: 1, month: 1 },
  { unique: true },
);

export const MonthlyBudget =
  mongoose.models.MonthlyBudget ??
  mongoose.model<IMonthlyBudget>("MonthlyBudget", monthlyBudgetSchema);

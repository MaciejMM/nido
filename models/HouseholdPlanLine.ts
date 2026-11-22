import mongoose, { type Document, Schema, Types } from "mongoose";

import { DEFAULT_HOUSEHOLD_ID } from "@/lib/finance/constants";
import type { IExpenseCategory } from "@/models/ExpenseCategory";

export type HouseholdLineKind = "income" | "expense";

export interface IHouseholdPlanLine extends Document {
  householdId: string;
  kindeUserId: string;
  year: number;
  month: number;
  kind: HouseholdLineKind;
  title: string;
  amount: number;
  notes?: string;
  sortOrder: number;
  categoryId?: Types.ObjectId | IExpenseCategory | null;
  createdAt: Date;
  updatedAt: Date;
}

const householdPlanLineSchema = new Schema<IHouseholdPlanLine>(
  {
    householdId: { type: String, default: DEFAULT_HOUSEHOLD_ID, index: true },
    kindeUserId: { type: String, required: true, index: true },
    year: { type: Number, required: true, min: 2000, max: 2100 },
    month: { type: Number, required: true, min: 1, max: 12 },
    kind: { type: String, enum: ["income", "expense"], required: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    notes: { type: String },
    sortOrder: { type: Number, default: 0 },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "ExpenseCategory",
    },
  },
  { timestamps: true },
);

householdPlanLineSchema.index({ householdId: 1, year: 1, month: 1, kind: 1 });
householdPlanLineSchema.index({ kindeUserId: 1, year: 1, month: 1, kind: 1 });

if (mongoose.models.HouseholdPlanLine) {
  mongoose.deleteModel("HouseholdPlanLine");
}

export const HouseholdPlanLine = mongoose.model<IHouseholdPlanLine>(
  "HouseholdPlanLine",
  householdPlanLineSchema,
);

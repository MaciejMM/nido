import mongoose, { type Document, Schema } from "mongoose";

export type HouseholdLineKind = "income" | "expense";

export interface IHouseholdPlanLine extends Document {
  kindeUserId: string;
  year: number;
  month: number;
  kind: HouseholdLineKind;
  title: string;
  amount: number;
  notes?: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const householdPlanLineSchema = new Schema<IHouseholdPlanLine>(
  {
    kindeUserId: { type: String, required: true, index: true },
    year: { type: Number, required: true, min: 2000, max: 2100 },
    month: { type: Number, required: true, min: 1, max: 12 },
    kind: { type: String, enum: ["income", "expense"], required: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    notes: { type: String },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

householdPlanLineSchema.index({ kindeUserId: 1, year: 1, month: 1, kind: 1 });

export const HouseholdPlanLine =
  mongoose.models.HouseholdPlanLine ??
  mongoose.model<IHouseholdPlanLine>(
    "HouseholdPlanLine",
    householdPlanLineSchema,
  );

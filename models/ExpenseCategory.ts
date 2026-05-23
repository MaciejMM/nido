import mongoose, { type Document, Schema } from "mongoose";

export interface IExpenseCategory extends Document {
  name: string;
  icon: string;
  color: string;
  monthlyLimit: number | null;
  householdId: string;
  isDefault: boolean;
  createdAt: Date;
}

const expenseCategorySchema = new Schema<IExpenseCategory>(
  {
    name: { type: String, required: true, trim: true },
    icon: { type: String, required: true },
    color: { type: String, required: true },
    monthlyLimit: { type: Number, min: 0, default: null },
    householdId: { type: String, required: true, default: "default" },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

expenseCategorySchema.index(
  { householdId: 1, name: 1 },
  { unique: true },
);

export const ExpenseCategory =
  mongoose.models.ExpenseCategory ??
  mongoose.model<IExpenseCategory>("ExpenseCategory", expenseCategorySchema);

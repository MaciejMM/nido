import mongoose, { type Document, Schema, type Types } from "mongoose";

export type ExpenseImportSource = "mbank_csv";

export interface IExpense extends Document {
  amount: number;
  title: string;
  categoryId: Types.ObjectId;
  date: Date;
  notes?: string;
  currency: string;
  householdId: string;
  importHash?: string;
  importSource?: ExpenseImportSource;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    amount: { type: Number, required: true, min: 0 },
    title: { type: String, required: true, trim: true },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "ExpenseCategory",
      required: true,
    },
    date: { type: Date, required: true },
    notes: { type: String },
    currency: { type: String, default: "PLN" },
    householdId: { type: String, required: true, default: "default" },
    importHash: { type: String },
    importSource: { type: String, enum: ["mbank_csv"] },
  },
  { timestamps: true },
);

expenseSchema.index({ householdId: 1, date: -1 });
expenseSchema.index({ householdId: 1, categoryId: 1, date: -1 });
expenseSchema.index(
  { householdId: 1, importHash: 1 },
  { unique: true, sparse: true },
);

export const Expense =
  mongoose.models.Expense ??
  mongoose.model<IExpense>("Expense", expenseSchema);

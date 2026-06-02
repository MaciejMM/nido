import mongoose, { type Document, Schema } from "mongoose";

export type PersonalExpenseVisibility = "private" | "shared";

export interface IPersonalExpense extends Document {
  kindeUserId: string;
  year: number;
  month: number;
  title: string;
  amount: number;
  currency: string;
  isPaid: boolean;
  paidAt?: Date;
  notes?: string;
  sortOrder: number;
  visibility: PersonalExpenseVisibility;
  createdAt: Date;
  updatedAt: Date;
}

const personalExpenseSchema = new Schema<IPersonalExpense>(
  {
    kindeUserId: { type: String, required: true, index: true },
    year: { type: Number, required: true, min: 2000, max: 2100 },
    month: { type: Number, required: true, min: 1, max: 12 },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "PLN" },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    notes: { type: String },
    sortOrder: { type: Number, default: 0 },
    visibility: {
      type: String,
      enum: ["private", "shared"],
      default: "private",
    },
  },
  { timestamps: true },
);

personalExpenseSchema.index({ kindeUserId: 1, year: 1, month: 1 });

export const PersonalExpense =
  mongoose.models.PersonalExpense ??
  mongoose.model<IPersonalExpense>("PersonalExpense", personalExpenseSchema);

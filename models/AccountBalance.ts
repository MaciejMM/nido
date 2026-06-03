import mongoose, { type Document, Schema } from "mongoose";

export type AccountBalanceSource = "import" | "manual";

export interface IAccountBalance extends Document {
  householdId: string;
  balance: number;
  asOf: Date;
  source: AccountBalanceSource;
  createdAt: Date;
  updatedAt: Date;
}

const accountBalanceSchema = new Schema<IAccountBalance>(
  {
    householdId: { type: String, required: true, unique: true, default: "default" },
    balance: { type: Number, required: true, min: 0 },
    asOf: { type: Date, required: true },
    source: { type: String, enum: ["import", "manual"], required: true },
  },
  { timestamps: true },
);

export const AccountBalance =
  mongoose.models.AccountBalance ??
  mongoose.model<IAccountBalance>("AccountBalance", accountBalanceSchema);

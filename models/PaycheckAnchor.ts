import mongoose, { type Document, Schema } from "mongoose";

export interface IPaycheckAnchor extends Document {
  householdId: string;
  operationDate: Date;
  amount: number;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const paycheckAnchorSchema = new Schema<IPaycheckAnchor>(
  {
    householdId: { type: String, required: true, default: "default" },
    operationDate: { type: Date, required: true },
    amount: { type: Number, required: true, min: 0 },
    title: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

paycheckAnchorSchema.index(
  { householdId: 1, operationDate: 1, amount: 1 },
  { unique: true },
);
paycheckAnchorSchema.index({ householdId: 1, operationDate: -1 });

export const PaycheckAnchor =
  mongoose.models.PaycheckAnchor ??
  mongoose.model<IPaycheckAnchor>("PaycheckAnchor", paycheckAnchorSchema);

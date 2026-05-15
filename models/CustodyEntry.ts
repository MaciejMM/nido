import mongoose, { type Document, Schema, type Types } from "mongoose";

export interface ICustodyEntry extends Document {
  startDate: Date;
  endDate: Date;
  ownerId: Types.ObjectId;
  notes?: string;
  // childId?: Types.ObjectId; // Future: support multiple children per household
  createdAt: Date;
  updatedAt: Date;
}

const custodyEntrySchema = new Schema<ICustodyEntry>(
  {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    notes: { type: String },
    // childId: { type: Schema.Types.ObjectId, ref: "Child", default: null },
  },
  { timestamps: true },
);

custodyEntrySchema.index({ ownerId: 1, startDate: 1 });
custodyEntrySchema.index({ ownerId: 1, endDate: 1 });

custodyEntrySchema.pre("save", function validateDates() {
  if (this.endDate < this.startDate) {
    throw new Error("endDate must be on or after startDate");
  }
});

export const CustodyEntry =
  mongoose.models.CustodyEntry ??
  mongoose.model<ICustodyEntry>("CustodyEntry", custodyEntrySchema);

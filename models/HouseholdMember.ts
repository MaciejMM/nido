import mongoose, { type Document, Schema } from "mongoose";

export interface IHouseholdMember extends Document {
  kindeUserId: string;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
}

const householdMemberSchema = new Schema<IHouseholdMember>(
  {
    kindeUserId: { type: String, required: true, unique: true },
    displayName: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export const HouseholdMember =
  mongoose.models.HouseholdMember ??
  mongoose.model<IHouseholdMember>("HouseholdMember", householdMemberSchema);

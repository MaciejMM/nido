import mongoose, { type Document, Schema } from "mongoose";

export type PersonalInclusionMode = "all" | "consolidated" | "none";

export interface IHouseholdPlanSettings extends Document {
  kindeUserId: string;
  year: number;
  month: number;
  personalInclusion: PersonalInclusionMode;
  createdAt: Date;
  updatedAt: Date;
}

const householdPlanSettingsSchema = new Schema<IHouseholdPlanSettings>(
  {
    kindeUserId: { type: String, required: true },
    year: { type: Number, required: true, min: 2000, max: 2100 },
    month: { type: Number, required: true, min: 1, max: 12 },
    personalInclusion: {
      type: String,
      enum: ["all", "consolidated", "none"],
      default: "consolidated",
    },
  },
  { timestamps: true },
);

householdPlanSettingsSchema.index(
  { kindeUserId: 1, year: 1, month: 1 },
  { unique: true },
);

export const HouseholdPlanSettings =
  mongoose.models.HouseholdPlanSettings ??
  mongoose.model<IHouseholdPlanSettings>(
    "HouseholdPlanSettings",
    householdPlanSettingsSchema,
  );

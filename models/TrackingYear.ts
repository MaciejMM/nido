import mongoose, { type Document, Schema } from "mongoose";

export interface ITrackingYear extends Document {
  value: number;
}

const trackingYearSchema = new Schema<ITrackingYear>(
  {
    value: { type: Number, required: true, unique: true },
  },
  { timestamps: true },
);

export const TrackingYear =
  mongoose.models.TrackingYear ??
  mongoose.model<ITrackingYear>("TrackingYear", trackingYearSchema);

import mongoose, { type Document, Schema } from "mongoose";

export interface INotificationSettings extends Document {
  enabled: boolean;
  reminderHour: number;
  timezone: string;
  householdId: string;
  updatedAt: Date;
}

const notificationSettingsSchema = new Schema<INotificationSettings>(
  {
    enabled: { type: Boolean, default: false },
    reminderHour: { type: Number, default: 20, min: 0, max: 23 },
    timezone: { type: String, default: "Europe/Warsaw" },
    householdId: { type: String, required: true, unique: true },
  },
  { timestamps: { updatedAt: true, createdAt: false } },
);

export const NotificationSettings =
  mongoose.models.NotificationSettings ??
  mongoose.model<INotificationSettings>(
    "NotificationSettings",
    notificationSettingsSchema,
  );

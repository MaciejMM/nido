import mongoose, { type Document, Schema } from "mongoose";

export interface IPushSubscription extends Document {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  householdId: string;
  createdAt: Date;
}

const pushSubscriptionSchema = new Schema<IPushSubscription>(
  {
    endpoint: { type: String, required: true, unique: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    householdId: { type: String, required: true, default: "default" },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

pushSubscriptionSchema.index({ householdId: 1 });

export const PushSubscription =
  mongoose.models.PushSubscription ??
  mongoose.model<IPushSubscription>("PushSubscription", pushSubscriptionSchema);

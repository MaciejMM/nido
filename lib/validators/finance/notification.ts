import { z } from "zod";

export const updateNotificationSettingsSchema = z.object({
  enabled: z.boolean(),
  reminderHour: z.coerce.number().int().min(0).max(23),
  timezone: z.string().trim().min(1).max(64),
});

export const pushSubscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export const pushUnsubscribeSchema = z.object({
  endpoint: z.string().url().optional(),
});

export const monthAnalysisQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});

export type UpdateNotificationSettingsSchema = z.infer<
  typeof updateNotificationSettingsSchema
>;
export type PushSubscribeSchema = z.infer<typeof pushSubscribeSchema>;

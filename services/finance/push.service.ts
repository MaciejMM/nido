import webpush from "web-push";

import { DEFAULT_HOUSEHOLD_ID } from "@/lib/finance/constants";
import { updateNotificationSettingsSchema } from "@/lib/validators/finance/notification";
import { pl } from "@/lib/i18n";
import { NotificationSettings } from "@/models/NotificationSettings";
import { PushSubscription } from "@/models/PushSubscription";
import type {
  NotificationSettingsDto,
  PushSubscribeInput,
  UpdateNotificationSettingsInput,
} from "@/types";
import { ValidationError } from "@/utils/errors";

function configureWebPush(): void {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:admin@example.com";

  if (!publicKey || !privateKey) {
    throw new Error(pl.finance.errors.vapidNotConfigured);
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export function getVapidPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY ?? null;
}

export async function getNotificationSettings(
  householdId = DEFAULT_HOUSEHOLD_ID,
): Promise<NotificationSettingsDto> {
  let settings = await NotificationSettings.findOne({ householdId }).exec();

  if (!settings) {
    settings = await NotificationSettings.create({
      householdId,
      enabled: false,
      reminderHour: 20,
      timezone: "Europe/Warsaw",
    });
  }

  return {
    enabled: settings.enabled,
    reminderHour: settings.reminderHour,
    timezone: settings.timezone,
  };
}

export async function updateNotificationSettings(
  input: UpdateNotificationSettingsInput,
  householdId = DEFAULT_HOUSEHOLD_ID,
): Promise<NotificationSettingsDto> {
  const parsed = updateNotificationSettingsSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      pl.finance.errors.invalidNotificationSettings,
      parsed.error.flatten(),
    );
  }

  const settings = await NotificationSettings.findOneAndUpdate(
    { householdId },
    parsed.data,
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).exec();

  return {
    enabled: settings!.enabled,
    reminderHour: settings!.reminderHour,
    timezone: settings!.timezone,
  };
}

export async function savePushSubscription(
  input: PushSubscribeInput,
  householdId = DEFAULT_HOUSEHOLD_ID,
): Promise<void> {
  await PushSubscription.findOneAndUpdate(
    { endpoint: input.endpoint },
    {
      endpoint: input.endpoint,
      keys: input.keys,
      householdId,
    },
    { upsert: true, new: true },
  ).exec();
}

export async function removePushSubscription(
  endpoint: string | undefined,
  householdId = DEFAULT_HOUSEHOLD_ID,
): Promise<void> {
  if (endpoint) {
    await PushSubscription.deleteOne({ endpoint, householdId }).exec();
    return;
  }

  await PushSubscription.deleteMany({ householdId }).exec();
}

export async function sendTestNotification(
  householdId = DEFAULT_HOUSEHOLD_ID,
): Promise<number> {
  configureWebPush();
  const subscriptions = await PushSubscription.find({ householdId }).exec();
  let sent = 0;

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: sub.keys,
        },
        JSON.stringify({
          title: pl.finance.push.testTitle,
          body: pl.finance.push.testBody,
        }),
      );
      sent += 1;
    } catch {
      await PushSubscription.deleteOne({ _id: sub._id }).exec();
    }
  }

  return sent;
}

function getHourInTimezone(timezone: string, now = new Date()): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    hour12: false,
  });
  return Number(formatter.format(now));
}

export async function sendReminderNotifications(
  householdId = DEFAULT_HOUSEHOLD_ID,
): Promise<number> {
  const settings = await NotificationSettings.findOne({ householdId }).exec();
  if (!settings?.enabled) return 0;

  const currentHour = getHourInTimezone(settings.timezone);
  if (currentHour !== settings.reminderHour) return 0;

  configureWebPush();
  const subscriptions = await PushSubscription.find({ householdId }).exec();
  let sent = 0;

  const payload = JSON.stringify({
    title: pl.finance.push.reminderTitle,
    body: pl.finance.push.reminderBody,
  });

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys },
        payload,
      );
      sent += 1;
    } catch {
      await PushSubscription.deleteOne({ _id: sub._id }).exec();
    }
  }

  return sent;
}

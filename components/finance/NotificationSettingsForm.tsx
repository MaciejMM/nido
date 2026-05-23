"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNotificationSettings } from "@/hooks/finance/use-notification-settings";
import {
  fetchVapidPublicKey,
  subscribePush,
  unsubscribePush,
} from "@/lib/finance-api-client";
import { pl } from "@/lib/i18n";
import {
  getBrowserPushSubscription,
  isWebPushSupported,
  mapPushSubscribeError,
  subscribeToWebPush,
  unsubscribeFromWebPush,
} from "@/lib/push-client";

export function NotificationSettingsForm() {
  const { settings, loading, saveSettings, sendTest, isSaving, isTesting } =
    useNotificationSettings();

  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [reminderHour, setReminderHour] = useState("20");
  const [timezone, setTimezone] = useState("Europe/Warsaw");

  const refreshPushState = useCallback(async () => {
    const subscription = await getBrowserPushSubscription();
    setPushSubscribed(subscription !== null);
  }, []);

  useEffect(() => {
    void refreshPushState();
  }, [refreshPushState]);

  useEffect(() => {
    if (!settings) return;
    setReminderHour(String(settings.reminderHour));
    setTimezone(settings.timezone);
  }, [settings]);

  const persistSettings = async (enabled: boolean) => {
    await saveSettings({
      enabled,
      reminderHour: Number(reminderHour),
      timezone,
    });
  };

  const handleSave = async () => {
    try {
      await persistSettings(pushSubscribed);
      toast.success(pl.finance.settings.saved);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : pl.common.requestFailed);
    }
  };

  const enablePush = async () => {
    if (!isWebPushSupported()) {
      toast.error(pl.finance.errors.pushNotSupported);
      return;
    }

    setPushLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error(pl.finance.settings.pushDisabled);
        return;
      }

      const publicKey = await fetchVapidPublicKey();
      if (!publicKey) {
        toast.error(pl.finance.errors.vapidNotConfigured);
        return;
      }

      const subscription = await subscribeToWebPush(publicKey);
      const json = subscription.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        throw new Error(pl.common.requestFailed);
      }

      await subscribePush({
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
      });

      await persistSettings(true);
      setPushSubscribed(true);
      toast.success(pl.finance.settings.pushEnabled);
    } catch (error) {
      toast.error(mapPushSubscribeError(error));
    } finally {
      setPushLoading(false);
    }
  };

  const disablePush = async () => {
    setPushLoading(true);
    try {
      const endpoint = await unsubscribeFromWebPush();
      await unsubscribePush(endpoint ?? undefined);
      await persistSettings(false);
      setPushSubscribed(false);
      toast.success(pl.finance.settings.pushDisabled);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : pl.common.requestFailed);
    } finally {
      setPushLoading(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">{pl.common.loading}</p>;
  }

  return (
    <div className="space-y-4 rounded-xl border border-border p-4">
      <div className="space-y-1">
        <p className="font-medium">
          {pushSubscribed
            ? pl.finance.settings.notifications
            : pl.finance.push.bannerTitle}
        </p>
        <p className="text-sm text-muted-foreground">
          {pushSubscribed
            ? pl.finance.settings.notificationsHint
            : pl.finance.push.bannerDescription}
        </p>
        {!pushSubscribed && (
          <p className="text-xs text-muted-foreground">{pl.finance.push.browserHint}</p>
        )}
      </div>

      {pushSubscribed ? (
        <>
          <div className="space-y-2">
            <Label>{pl.finance.settings.reminderHour}</Label>
            <Input
              type="number"
              min={0}
              max={23}
              value={reminderHour}
              onChange={(e) => setReminderHour(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{pl.finance.settings.timezone}</Label>
            <Input value={timezone} onChange={(e) => setTimezone(e.target.value)} />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void handleSave()} disabled={isSaving || pushLoading}>
              {isSaving ? pl.finance.expenses.saving : pl.finance.expenses.save}
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const sent = await sendTest();
                  toast.success(pl.finance.settings.testPushSent(sent));
                } catch (error) {
                  toast.error(
                    error instanceof Error ? error.message : pl.common.requestFailed,
                  );
                }
              }}
              disabled={isTesting || pushLoading}
            >
              {pl.finance.settings.testPush}
            </Button>
            <Button
              variant="outline"
              onClick={() => void disablePush()}
              disabled={pushLoading || isSaving}
            >
              {pl.finance.settings.disablePush}
            </Button>
          </div>
        </>
      ) : (
        <Button onClick={() => void enablePush()} disabled={pushLoading}>
          {pl.finance.settings.enablePush}
        </Button>
      )}
    </div>
  );
}

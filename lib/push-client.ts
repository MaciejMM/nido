import { pl } from "@/lib/i18n";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

export function isWebPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window &&
    window.isSecureContext
  );
}

async function waitForServiceWorkerActivation(
  registration: ServiceWorkerRegistration,
): Promise<ServiceWorkerRegistration> {
  if (registration.active) {
    return registration;
  }

  const worker = registration.installing ?? registration.waiting;
  if (worker) {
    await new Promise<void>((resolve, reject) => {
      worker.addEventListener("statechange", () => {
        if (worker.state === "activated") resolve();
        if (worker.state === "redundant") {
          reject(new Error(pl.finance.errors.pushServiceWorkerFailed));
        }
      });
    });
    return registration;
  }

  await navigator.serviceWorker.ready;
  return registration;
}

export async function ensurePushServiceWorker(): Promise<ServiceWorkerRegistration> {
  const registration = await navigator.serviceWorker.register("/sw.js", {
    scope: "/",
  });
  return waitForServiceWorkerActivation(registration);
}

export function mapPushSubscribeError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("push service not available")) {
    return pl.finance.errors.pushServiceUnavailable;
  }
  if (
    message.includes("no active Service Worker") ||
    message.includes("no active service worker")
  ) {
    return pl.finance.errors.pushNoServiceWorker;
  }
  if (message.includes("applicationServerKey")) {
    return pl.finance.errors.vapidNotConfigured;
  }

  return message || pl.common.requestFailed;
}

export async function subscribeToWebPush(publicKey: string): Promise<PushSubscription> {
  const registration = await ensurePushServiceWorker();
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });
}

export async function getBrowserPushSubscription(): Promise<PushSubscription | null> {
  if (!isWebPushSupported()) return null;

  const registration = await navigator.serviceWorker.getRegistration("/");
  if (!registration) return null;

  return registration.pushManager.getSubscription();
}

export async function unsubscribeFromWebPush(): Promise<string | null> {
  const subscription = await getBrowserPushSubscription();
  if (!subscription) return null;

  const endpoint = subscription.endpoint;
  const success = await subscription.unsubscribe();
  if (!success) {
    throw new Error(pl.common.requestFailed);
  }

  return endpoint;
}

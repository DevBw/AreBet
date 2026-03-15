"use client";

import { useCallback, useEffect, useState } from "react";

export type NotifPermission = "default" | "granted" | "denied" | "unsupported";

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotifPermission>("default");

  useEffect(() => {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as NotifPermission);
  }, []);

  const requestPermission = useCallback(async (): Promise<NotifPermission> => {
    if (!("Notification" in window)) return "unsupported";
    if (Notification.permission === "granted") return "granted";

    const result = await Notification.requestPermission();
    setPermission(result as NotifPermission);
    return result as NotifPermission;
  }, []);

  const sendNotification = useCallback(
    async (title: string, body: string, icon = "/arebet-logo.svg") => {
      if (!("Notification" in window)) return;
      if (Notification.permission !== "granted") return;

      // Prefer SW registration for better reliability
      if ("serviceWorker" in navigator) {
        try {
          const reg = await navigator.serviceWorker.ready;
          await reg.showNotification(title, { body, icon, badge: icon });
          return;
        } catch {
          // Fall through to direct Notification
        }
      }

      new Notification(title, { body, icon });
    },
    []
  );

  return { permission, requestPermission, sendNotification };
}

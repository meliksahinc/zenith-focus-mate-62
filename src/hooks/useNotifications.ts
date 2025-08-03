import { useCallback, useState, useEffect } from "react";

interface NotificationConfig {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
}

export const useNotifications = () => {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported("Notification" in window);
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    } catch (error) {
      console.error("Failed to request notification permission:", error);
      return false;
    }
  }, [isSupported]);

  const sendNotification = useCallback(
    (config: NotificationConfig) => {
      if (!isSupported || permission !== "granted") {
        console.warn("Notifications not supported or permission not granted");
        return;
      }

      try {
        const notification = new Notification(config.title, {
          body: config.body,
          icon: config.icon || "/favicon.ico",
          badge: config.badge || "/favicon.ico",
          tag: config.tag || "focus-coach",
          requireInteraction: false,
          silent: false,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        // Auto close after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);

        return notification;
      } catch (error) {
        console.error("Failed to send notification:", error);
      }
    },
    [isSupported, permission]
  );

  const sendFocusStartNotification = useCallback(
    (userName: string) => {
      sendNotification({
        title: "🎯 Focus Session Started",
        body: `Time to focus, ${userName}! Your session has begun.`,
        tag: "focus-start",
      });
    },
    [sendNotification]
  );

  const sendFocusCompleteNotification = useCallback(
    (userName: string) => {
      sendNotification({
        title: "✅ Focus Session Complete",
        body: `Great job, ${userName}! You've completed your focus session.`,
        tag: "focus-complete",
      });
    },
    [sendNotification]
  );

  const sendBreakStartNotification = useCallback(
    (userName: string, duration: number) => {
      sendNotification({
        title: "☕ Break Time",
        body: `${userName}, take a ${duration}-minute break to recharge.`,
        tag: "break-start",
      });
    },
    [sendNotification]
  );

  const sendBreakCompleteNotification = useCallback(
    (userName: string) => {
      sendNotification({
        title: "🚀 Break Complete",
        body: `Break is over, ${userName}! Ready to focus again?`,
        tag: "break-complete",
      });
    },
    [sendNotification]
  );

  const sendDistractionNotification = useCallback(
    (userName: string) => {
      sendNotification({
        title: "⚠️ Stay Focused",
        body: `${userName}, you seem distracted. Come back to your work!`,
        tag: "distraction",
      });
    },
    [sendNotification]
  );

  return {
    isSupported,
    permission,
    requestPermission,
    sendNotification,
    sendFocusStartNotification,
    sendFocusCompleteNotification,
    sendBreakStartNotification,
    sendBreakCompleteNotification,
    sendDistractionNotification,
  };
};

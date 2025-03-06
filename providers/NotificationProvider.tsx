import { registerForPushNotificationsAsync } from "@/lib/notifications";
import { supabase } from "@/lib/supabase";
import * as Notifications from "expo-notifications";
import { PropsWithChildren, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthProvider";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function fetchReminders(userId: string) {
  const { data, error, status } = await supabase
    .from("reminders")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    return;
  }

  if (status === 200) {
    return data;
  }
}

async function scheduleRecurringNotifications(userId: string) {
  try {
    // Fetch existing notifications
    const { data: existingNotifications, error: fetchError } = await supabase
      .from("notifications")
      .select("notification_id, reminder_id")
      .eq("user_id", userId);

    if (fetchError) {
      console.error("Error fetching existing notifications:", fetchError);
      return;
    }

    const existingNotificationIds = new Set(
      existingNotifications?.map((n) => n.notification_id) || []
    );

    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (!existingNotificationIds.has(notif.identifier)) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }

    const reminders = await fetchReminders(userId);
    if (!reminders) return;

    const scheduledIds = [];

    for (const reminder of reminders) {
      let triggerDate;

      // Use start_date or next_due as the full datetime
      if (reminder.frequency === "once" && reminder.start_date) {
        triggerDate = new Date(reminder.start_date); // Full datetime from DB
      } else {
        triggerDate = new Date(reminder.next_due); // Full datetime from DB
      }

      const now = new Date();
      const isSameDay = triggerDate.toDateString() === now.toDateString();
      if (triggerDate < now && !isSameDay) {
        console.log(`Skipping ${reminder.title} - date is in the past`);
        continue;
      }

      const existingNotification = existingNotifications?.find(
        (n) => n.reminder_id === reminder.id
      );

      let notificationId = existingNotification?.notification_id;

      if (!notificationId) {
        notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: reminder.title,
            body: reminder.notes,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerDate.getTime(), // Local time in milliseconds
          },
        });

        const payload = {
          notification_id: notificationId,
          reminder_id: reminder.id,
          type: reminder.type,
          title: reminder.title,
          body: reminder.notes,
          time: triggerDate.toISOString(),
          user_id: userId,
        };

        const { error, status } = await supabase
          .from("notifications")
          .insert(payload);

        if (status === 201) {
          console.log(`Notification stored in DB for ${reminder.title}`);
        } else if (error) {
          console.error(`Failed to store notification: ${error.message}`);
        }
      }

      scheduledIds.push(notificationId);
      console.log(
        `Scheduled "${
          reminder.title
        }" for ${triggerDate.toISOString()} with ID: ${notificationId}`
      );
    }

    return scheduledIds;
  } catch (error) {
    console.error("Error scheduling notifications:", error);
    throw error;
  }
}

const NotificationProvider = ({ children }: PropsWithChildren) => {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);

  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  const { session } = useAuth();

  const savePushToken = async (newToken: string | undefined) => {
    setExpoPushToken(newToken ?? "");

    if (!newToken) return;

    const { status } = await supabase
      .from("profiles")
      .update({ expo_push_token: newToken })
      .eq("id", session?.user.id);

    if (status === 204) {
      // console.log(`ExponentPushToken added to user`);
    }
  };

  useEffect(() => {
    // console.warn("NotificationProvider init");

    registerForPushNotificationsAsync()
      .then((token) => savePushToken(token))
      .catch((error: any) => setExpoPushToken(`${error}`));

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useEffect(() => {
    if (session) {
      const setupNotifications = async () => {
        try {
          const hasPermission = await registerForPushNotificationsAsync();
          if (hasPermission) {
            await scheduleRecurringNotifications(session.user.id);
          } else {
            console.warn("No notification permissions granted");
          }
        } catch (error) {
          console.error("Error setting up notifications:", error);
        }
      };

      setupNotifications();
    }
  }, [session]);

  return <>{children}</>;
};

export default NotificationProvider;

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
    // Clear existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Fetch reminders from Supabase
    const reminders = await fetchReminders(userId);

    // Schedule notification for each reminder
    const scheduledIds = [];
    for (const reminder of reminders ?? []) {
      let triggerDate;

      // Handle "once" frequency with start_date and optional time
      if (reminder.frequency === "once" && reminder.start_date) {
        triggerDate = new Date(reminder.start_date);

        // If time is specified, include it
        if (reminder.time) {
          const [hours, minutes, seconds] = reminder.time.split(":");
          triggerDate.setHours(parseInt(hours));
          triggerDate.setMinutes(parseInt(minutes));
          triggerDate.setSeconds(parseInt(seconds || 0));
        } else {
          // If no time specified, set to start of day (midnight)
          triggerDate.setHours(0, 0, 0, 0);
        }
      } else {
        // For other frequencies, use next_due
        triggerDate = new Date(reminder.next_due);
      }

      // Get current date and time
      const now = new Date();

      // For logging/debugging
      // console.log({
      //   title: reminder.title,
      //   triggerDate: triggerDate.toISOString(),
      //   currentTime: now.toISOString(),
      // });

      // Only skip if trigger date is strictly before today
      // For same-day notifications, allow if time is in the future
      const isSameDay = triggerDate.toDateString() === now.toDateString();
      if (triggerDate < now && !isSameDay) {
        // console.log(`Skipping ${reminder.title} - date is in the past`);
        continue;
      }

      try {
        // console.log(`triggerDate.getTime()-----------`, triggerDate.getTime());
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: reminder.title,
            body: `${
              !!reminder.notes
                ? reminder.notes
                : `Time for ${reminder.type} (Pet ID: ${reminder.pet_id})`
            } `,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerDate.getTime(),
          },
        });

        scheduledIds.push(notificationId);

        const payload = {
          notification_id: notificationId,
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          title: reminder.title,
          body: !!reminder.notes && reminder.notes,
          time: triggerDate.getTime(),
          user_id: reminder.user_id,
        };

        const { data, error, status } = await supabase
          .from("notifications")
          .insert(payload);

        if (status === 201) {
          console.log(`Notification stored in DB.`);
        }
        if (error) {
          console.error(`Notification couldn't be stored in DB.`);
        }

        // console.log(
        //   `Scheduled "${reminder.title}" for ${triggerDate} with ID: ${notificationId}`
        // );
      } catch (e) {
        // console.error(`Failed to schedule ${reminder.title}:`, e);
        continue;
      }
    }

    // Verify all scheduled notifications
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    // console.log("Currently scheduled notifications:", scheduled);

    return scheduledIds;
  } catch (error) {
    // console.error("Error scheduling notifications:", error);
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
    if (!!session) {
      // Schedule notifications once permissions are granted
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

import { registerForNotificationsPermission } from "@/lib/notifications";
import { supabase } from "@/lib/supabase";
import * as Notifications from "expo-notifications";
import { PropsWithChildren, useEffect, useRef, useState } from "react";
import { Alert, Linking } from "react-native";
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

    // Clean up orphaned notifications
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
      // Parse the time (e.g., "20:40" -> { hour: 20, minute: 40 })
      const [hour, minute, seconds] = reminder.time.split(":").map(Number);
      const now = new Date();

      // Handle one-time notification
      if (reminder.frequency === "once" && reminder.start_date) {
        const triggerDate = new Date(reminder.start_date);
        triggerDate.setHours(hour, minute, 0, 0); // Set to specified time

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
              date: triggerDate.getTime(), // One-time trigger
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
            pet_id: reminder.pet_id,
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
          `Scheduled one-time "${
            reminder.title
          }" for ${triggerDate.toISOString()} with ID: ${notificationId}`
        );
      }

      // Handle daily notification
      else if (
        reminder.frequency === "daily" &&
        reminder.start_date &&
        reminder.end_date
      ) {
        let currentDate = new Date(reminder.start_date);
        currentDate.setHours(hour, minute, 0, 0); // Set to specified time
        const endDate = new Date(reminder.end_date);
        endDate.setHours(hour, minute, 0, 0);

        const existingNotification = existingNotifications?.find(
          (n) => n.reminder_id === reminder.id
        );
        let notificationIds = existingNotification
          ? [existingNotification.notification_id]
          : [];

        if (!existingNotification) {
          // Option 1: Schedule individual notifications for each day
          while (currentDate <= endDate) {
            const isSameDay = currentDate.toDateString() === now.toDateString();
            if (currentDate < now && !isSameDay) {
              currentDate.setDate(currentDate.getDate() + 1); // Skip past dates
              continue;
            }

            const notificationId =
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: reminder.title,
                  body: reminder.notes,
                },
                trigger: {
                  type: Notifications.SchedulableTriggerInputTypes.DATE,
                  date: currentDate.getTime(), // One-time trigger per day
                },
              });

            const payload = {
              notification_id: notificationId,
              reminder_id: reminder.id,
              type: reminder.type,
              title: reminder.title,
              body: reminder.notes,
              time: currentDate.toISOString(),
              user_id: userId,
            };

            const { error, status } = await supabase
              .from("notifications")
              .insert(payload);

            if (status === 201) {
              console.log(
                `Daily notification stored for ${
                  reminder.title
                } on ${currentDate.toISOString()}`
              );
            } else if (error) {
              console.error(`Failed to store notification: ${error.message}`);
            }

            notificationIds.push(notificationId);
            currentDate.setDate(currentDate.getDate() + 1); // Next day
          }
        }

        scheduledIds.push(...notificationIds);
        console.log(
          `Scheduled daily "${reminder.title}" from ${reminder.start_date} to ${reminder.end_date} with IDs: ${notificationIds}`
        );
      }
    }

    return scheduledIds;
  } catch (error) {
    console.error("Error scheduling notifications:", error);
    throw error;
  }
}

const NotificationProvider = ({ children }: PropsWithChildren) => {
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);

  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  const { session } = useAuth();

  useEffect(() => {
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
        const hasPermission = await registerForNotificationsPermission();
        if (hasPermission) {
          await scheduleRecurringNotifications(session.user.id);
        } else {
          // Provide user feedback when permissions are denied
          Alert.alert(
            "Notifications Disabled",
            "You won’t receive notifications because permission was denied. You can enable them in your device settings.",
            [
              { text: "OK", style: "cancel" },
              // Optional: Add a button to open settings (platform-specific)
              { text: "Open Settings", onPress: () => Linking.openSettings() },
            ]
          );
        }
      };

      setupNotifications();
    }
  }, [session]);

  return <>{children}</>;
};

export default NotificationProvider;

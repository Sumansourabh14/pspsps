```
async function scheduleRecurringNotification() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Date",
        body: "Change sides!",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date().setSeconds(new Date().getSeconds() + 10),
      },
    });
    console.log("Notification scheduled with ID:", notificationId);
    // Verify scheduled notifications
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log("Currently scheduled notifications:", scheduled);
  } catch (error) {
    console.error("Error scheduling notification:", error);
  }
}
```

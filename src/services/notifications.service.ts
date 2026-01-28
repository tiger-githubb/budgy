import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NotificationsService = {
  async requestPermissions() {
    if (!Device.isDevice) return false;

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === "granted";
  },

  async scheduleDailyReminders(startingFromDate: Date) {
    // First cancel all to keep it clean
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (!Device.isDevice) return;

    const hours = [18, 19, 20, 21, 22];
    const baseDate = new Date(startingFromDate);

    let count = 0;
    // Schedule for next 7 days
    for (let d = 0; d < 7; d++) {
      const dayDetails = new Date(baseDate);
      dayDetails.setDate(dayDetails.getDate() + d);

      for (const hour of hours) {
        const target = new Date(dayDetails);
        target.setHours(hour, 0, 0, 0);

        // If target is in the past, skip
        if (target.getTime() <= Date.now()) continue;

        // Schedule
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "💸 N'oublie pas tes dépenses !",
            body: "Une petite dépense aujourd'hui ? Note-la vite !",
            sound: true,
            data: { url: "/(expenses)/add-expense/index" },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: target,
          },
        });
        count++;
      }
    }
    console.log(`Scheduled ${count} reminders for the next 7 days.`);
  },

  async handleExpenseAdded() {
    console.log("Expense added! Resetting reminders for tomorrow.");
    // Cancel everything
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Restart schedule from Tomorrow morning (so 18h is tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);

    await this.scheduleDailyReminders(tomorrow);
  },

  async checkAndScheduleIfNeeded(hasExpenseToday: boolean) {
    if (hasExpenseToday) {
      await this.handleExpenseAdded();
    } else {
      console.log(
        "No expense yet today. Ensuring reminders are active for today.",
      );
      await this.scheduleDailyReminders(new Date());
    }
  },
};

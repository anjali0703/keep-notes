// reminderUtils.js

// Calculate next reminder based on repeat type
export function getNextReminder(reminder) {
  if (!reminder.active) return null;
  const next = new Date(reminder.date);
  switch (reminder.repeat) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "custom":
      next.setDate(next.getDate() + reminder.customInterval);
      break;
    case "none":
    default:
      return null;
  }
  return next.toISOString();
}

// Stop a reminder
export function stopReminder(reminder, updateReminder) {
  updateReminder({ ...reminder, active: false });
}

// Trigger reminder (browser notification or alert)
export function triggerReminder(reminder, updateReminder) {
  if (!reminder.active) return;

  if (Notification.permission === "granted") {
    new Notification(reminder.title || "Reminder!", {
      body: "Time for your note reminder ⏰",
    });
  } else {
    alert(`Reminder: ${reminder.title || "Time for your note!"}`);
  }

  const nextDate = getNextReminder(reminder);
  if (nextDate) {
    updateReminder({ ...reminder, date: nextDate });
  } else {
    stopReminder(reminder, updateReminder);
  }
}
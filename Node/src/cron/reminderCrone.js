const cron = require("node-cron");
const Note = require("../models/Note");
const sendEmail = require("../utils/sendReminderEmail");

module.exports = function reminderCron() {
  console.log("Reminder cron job started");

  cron.schedule("* * * * *", async () => {
    console.log("Cron tick:", new Date().toLocaleTimeString());

    try {
      const notes = await Note.find({
        "reminder.active": true,
        "reminder.emailSent": false
      }).populate("userId");

      console.log("Notes to process:", notes.length);

      const now = new Date();

      for (const note of notes) {
        const user = note.userId;
        if (!user || !user.email) continue;
        if (!note.reminder.date) continue;

        const reminderTime = new Date(note.reminder.date);
        const emailTime = new Date(reminderTime.getTime() - 10 * 60 * 1000); // 10 min before

        // ❌ Skip if emailSent is already true
        if (note.reminder.emailSent) continue;

        // Only send **once**
        if (now >= emailTime) {
          // Immediately mark emailSent before sending (prevents multiple sends)
          note.reminder.emailSent = true;
          await note.save();

          const combined = note.title && note.content ? `${note.title} || ${note.content}` : (note.title || note.content);
          await sendEmail(user.email, combined, reminderTime);

          console.log(`Reminder email sent for note ${note._id} to ${user.email}`);
        }
      }
    } catch (err) {
      console.error("Cron job error:", err);
    }
  });
};
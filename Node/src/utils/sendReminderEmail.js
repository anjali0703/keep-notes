const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "anjalivegad1706@gmail.com",
    pass: "ebkzybtiyxkmppjt"
  }
});

const sendReminderEmail = async (to, combined, reminderTime) => {
  if (!to) return console.error("No recipient email provided");
  if (!reminderTime || isNaN(new Date(reminderTime))) return console.error("Invalid reminder time");

  try {
    await transporter.sendMail({
      from: '"Keep Clone" <anjalivegad1706@gmail.com>',
      to,
      subject: `🔔 Reminder: ${combined}`,
      html: `
        <div style="font-family: Arial; max-width:600px; margin:auto; padding:20px; border:1px solid #ddd; border-radius:10px; background:#f9f9f9;">
          <h2 style="color:#4A90E2; text-align:center;">⏰ Reminder Notification</h2>
          <p>Hi there,</p>
          <p>You have a reminder scheduled:</p>
          <table style="width:100%; border-collapse:collapse; margin:50px 0; background:#e8f0fe;">
            <tr>
              <td style="padding:10px; font-weight:bold; background:#e8f0fe; border-radius:5px;">Reminder</td>
              <td style="padding:10px;">${combined}</td>
            </tr>
            <tr>
              <td style="padding:10px; font-weight:bold; background:#e8f0fe; border-radius:5px;">Scheduled Time</td>
              <td style="padding:10px;">${new Date(reminderTime).toLocaleString()}</td>
            </tr>
          </table>
          <p style="font-size:14px; color:#555;">This is an automated reminder from Keep Clone. Please do not reply to this email.</p>
          <hr style="border:0; border-top:1px solid #ddd; margin:20px 0;" />
          <p style="font-size:12px; color:#999; text-align:center;">&copy; 2026 Keep Clone. All rights reserved.</p>
        </div>
      `
    });

    console.log("Reminder email sent to", to);
  } catch (err) {
    console.error("Email error:", err);
  }
};

module.exports = sendReminderEmail;
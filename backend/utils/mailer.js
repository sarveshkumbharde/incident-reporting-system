const nodemailer = require("nodemailer");
const emailQueue = require("../queues/email.queue");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendMail = async ({ to, subject, html }) => {
  try {
    await emailQueue.add("sendEmail", {
      to: user.email,
      subject: "Incident Update",
      text: "Your incident status updated",
    });
  } catch (error) {
    console.error("❌ Email task added to queue:", error.message);
  }
};

module.exports = { sendMail };

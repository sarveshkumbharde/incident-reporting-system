const { Worker } = require("bullmq");
const redis = require("../config/redis");
const { transporter } = require("../utils/mailer");

const worker = new Worker(
  "emailQueue",
  async (job) => {
    const { to, subject, text, html } = job.data;

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to,
      subject,
      html,
      text,
    });
  },
  {
    connection: redis,
  }
);

worker.on("failed", (job, err) => {
  console.error("❌ Email job failed:", err);
});

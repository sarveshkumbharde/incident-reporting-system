const { Worker } = require("bullmq");
const redis = require("../config/redis");
const transporter = require("../utils/mailer"); // your existing mail config

const worker = new Worker(
  "emailQueue",
  async (job) => {
    const { to, subject, text } = job.data;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
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
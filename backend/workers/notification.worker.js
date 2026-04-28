const { Worker } = require("bullmq");
const redis = require("../config/redis");

const worker = new Worker(
  "notificationQueue",
  async (job) => {
    const { userId, message } = job.data;

    const io = global.io; // set this in server.js

    if (io && io.sockets.adapter.rooms.get(userId)) {
      io.to(userId).emit("notification", message);
    } else {
      // fallback → email queue
      const emailQueue = require("../queues/email.queue");

      await emailQueue.add("sendEmail", {
        to: job.data.email,
        subject: "Notification",
        text: message,
      });
    }
  },
  { connection: redis }
);
const { Worker } = require("bullmq");
const redis = require("../config/redis");
const { QUEUE_NAME } = require("../queues/notification.queue");
const { sendNotification } = require("../utils/sendNotification");

console.log(`[BullMQ][Notifications] Worker booting for queue: ${QUEUE_NAME}`);

const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    const { userId, message, incidentId, type = "info" } = job.data;

    console.log("[BullMQ][Notifications] Processing job", {
      jobId: job.id,
      name: job.name,
      userId,
      incidentId,
      type,
      attempt: job.attemptsMade + 1,
    });

    const notification = await sendNotification(userId, message, incidentId, type, global.io);

    console.log("[BullMQ][Notifications] Delivery finished", {
      jobId: job.id,
      userId,
      notificationId: notification?._id?.toString() || null,
    });

    return {
      notificationId: notification?._id?.toString() || null,
    };
  },
  { connection: redis },
);

worker.on("ready", () => {
  console.log(`[BullMQ][Notifications] Worker ready: ${QUEUE_NAME}`);
});

worker.on("active", (job) => {
  console.log("[BullMQ][Notifications] Job active", {
    jobId: job.id,
    name: job.name,
  });
});

worker.on("completed", (job, result) => {
  console.log("[BullMQ][Notifications] Job completed", {
    jobId: job.id,
    name: job.name,
    result,
  });
});

worker.on("failed", (job, err) => {
  console.error("[BullMQ][Notifications] Job failed", {
    jobId: job?.id,
    name: job?.name,
    error: err.message,
    attemptsMade: job?.attemptsMade,
  });
});

worker.on("error", (error) => {
  console.error("[BullMQ][Notifications] Worker error:", error.message);
});

module.exports = worker;

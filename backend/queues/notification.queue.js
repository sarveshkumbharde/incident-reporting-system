const { Queue } = require("bullmq");
const redis = require("../config/redis");

const QUEUE_NAME = "notificationQueue";

const notificationQueue = new Queue(QUEUE_NAME, {
  connection: redis,
});

console.log(`[BullMQ][Notifications] Queue initialized: ${QUEUE_NAME}`);

const enqueueNotification = async ({
  name = "send-notification",
  userId,
  message,
  incidentId = null,
  type = "info",
  metadata = {},
}) => {
  if (!userId || !message) {
    console.warn("[BullMQ][Notifications] Skipped enqueue: missing userId or message", {
      userId,
      hasMessage: Boolean(message),
    });
    return null;
  }

  const payload = {
    userId: userId.toString(),
    message,
    incidentId: incidentId ? incidentId.toString() : null,
    type,
    metadata,
  };

  console.log("[BullMQ][Notifications] Enqueue requested", {
    name,
    userId: payload.userId,
    incidentId: payload.incidentId,
    type,
  });

  let job;

  try {
    job = await notificationQueue.add(name, payload, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
      removeOnComplete: {
        age: 60 * 60,
        count: 1000,
      },
      removeOnFail: {
        age: 24 * 60 * 60,
        count: 5000,
      },
    });
  } catch (error) {
    console.error("[BullMQ][Notifications] Enqueue failed", {
      name,
      userId: payload.userId,
      incidentId: payload.incidentId,
      type,
      error: error.message,
    });
    return null;
  }

  console.log("[BullMQ][Notifications] Job enqueued", {
    jobId: job.id,
    name: job.name,
    userId: payload.userId,
    incidentId: payload.incidentId,
    type,
  });

  return job;
};

module.exports = notificationQueue;
module.exports.enqueueNotification = enqueueNotification;
module.exports.QUEUE_NAME = QUEUE_NAME;

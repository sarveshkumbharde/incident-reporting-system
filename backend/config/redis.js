const IORedis = require("ioredis");

const redis = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

redis.on("connect", () => {
  console.log("[Redis] Connecting to 127.0.0.1:6379");
});

redis.on("ready", () => {
  console.log("[Redis] Connection ready");
});

redis.on("error", (error) => {
  console.error("[Redis] Connection error:", error.message);
});

module.exports = redis;

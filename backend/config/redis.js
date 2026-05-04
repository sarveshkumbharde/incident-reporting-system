const IORedis = require("ioredis");
require("dotenv").config();

// Use REDIS_URL if provided (for production/Upstash), otherwise use local
const redis = process.env.REDIS_URL 
  ? new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null })
  : new IORedis({
      host: "127.0.0.1",
      port: 6379,
      maxRetriesPerRequest: null,
    });

redis.on("connect", () => {
  const target = process.env.REDIS_URL ? "Upstash" : "127.0.0.1";
  console.log(`[Redis] Connecting to ${target}`);
});

// ... rest of your events

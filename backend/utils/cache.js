const redis = require("../config/redis");

const getCache = async (key) => {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
};

const setCache = async (key, value, ttl = 60) => {
  await redis.set(key, JSON.stringify(value), "EX", ttl);
  if (key.startsWith("incidents_")) {
    await redis.sadd("active_incident_list_keys", key);
  }
};

module.exports = { getCache, setCache };
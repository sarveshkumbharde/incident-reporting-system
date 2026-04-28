const redis = require("../config/redis");

const invalidateIncidentCaches = async (incidentId) => {
  try {
    // ❌ Delete single incident cache
    await redis.del(`incident_${incidentId}`);

    // ❌ Delete ALL role-based incident lists
    const keys = await redis.keys("incidents_*");

    if (keys.length > 0) {
      await redis.del(keys);
    }
  } catch (err) {
    console.error("Cache invalidation error:", err);
  }
};

module.exports = { invalidateIncidentCaches };
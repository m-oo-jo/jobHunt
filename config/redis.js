// Create a Redis connection using the URL stored in .env
const Redis = require("ioredis");

// Configure Redis for BullMQ worker connections
const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});
// Log Redis connection status
redis.on("connect", () => {
  console.log("Redis connected successfully");
});

redis.on("error", (error) => {
  console.error("Redis connection error:", error);
});

module.exports = redis;
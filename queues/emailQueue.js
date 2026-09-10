const { Queue } = require("bullmq");

const emailQueue = new Queue("emailQueue", {
  connection: {
    url: process.env.REDIS_URL,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "fixed",
      delay: 5000,
    },
  },
});

module.exports = emailQueue;
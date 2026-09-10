require("dotenv").config();

const { Worker } = require("bullmq");
const Redis = require("ioredis");
const connectDB = require("../config/db");

const Application = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");
const sendApplicationEmail = require("../services/emailService");

const workerRedis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

connectDB();

const worker = new Worker(
  "emailQueue",
  async (job) => {
    console.log("Processing email job:", job.id);

    const application = await Application.findById(job.data.applicationId);
    const jobData = await Job.findById(job.data.jobId).populate("recruiter");

    if (!application || !jobData) {
      throw new Error("Application or job not found");
    }

    const emailSent = await sendApplicationEmail(application, jobData);

    if (!emailSent) {
      throw new Error("Failed to send application email");
    }

    console.log("Email job completed:", job.id);
  },
  {
    connection: workerRedis,
  }
);

worker.on("failed", (job, error) => {
  console.error(`Email job ${job?.id} failed:`, error.message);
});

console.log("Email worker is running");
// Load environment variables

require("dotenv").config();

const express = require("express");

const connectDB = require("./config/db");

const bcrypt = require("bcryptjs");

const User = require("./models/User");

const Job = require("./models/Job");

const Application = require("./models/Application");

const cookieParser = require("cookie-parser");

const jwt = require("jsonwebtoken");

const authMiddleware = require("./middleware/authMiddleware");

const recruiterMiddleware = require("./middleware/recruiterMiddleware");

const rateLimit = require("express-rate-limit");

const redis = require("./config/redis");

const emailQueue = require("./queues/emailQueue");

const app = express();
// ====================
// Rate Limiting
// ====================

// Limit repeated application requests to protect the API from abuse
const applicationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: {
    message: "Too many application attempts. Please try again later.",
  },
});

// Connect to MongoDB
connectDB();

// ====================
// Middleware
// ====================

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Log incoming requests for server monitoring
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Make login status available to EJS pages
app.use((req, res, next) => {
  const token = req.cookies.token;

  res.locals.isLoggedIn = false;

  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      res.locals.isLoggedIn = true;
    } catch (error) {
      res.locals.isLoggedIn = false;
    }
  }

  next();
});

app.set("view engine", "ejs");

// ====================
// Public Page Routes
// ====================

app.get("/", (req, res) => {
  res.render("index", {
    jobTitle: "Software Engineer",
    company: "TechNova Solutions",
    location: "Remote",
    description:
      "We are looking for a motivated software engineer to join our development team.",
  });
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

app.get("/apply", (req, res) => {
  res.render("apply");
});

// ====================
// Authentication Routes
// ====================

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    res.redirect("/login?registered=true");
  } catch (error) {
    console.error(error);
    res.status(500).send("Registration failed");
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).send("Invalid email or password");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).send("Invalid email or password");
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
    });

    if (user.role === "recruiter") {
      return res.redirect("/recruiter");
    }

    return res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("Login failed");
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

// ====================
// Job Page Routes
// ====================

app.get("/jobs", (req, res) => {
  res.render("jobs");
});

app.get("/jobs/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const job = await Job.findOne({ id: id });

    if (!job) {
      return res.status(404).send("Job not found");
    }

    res.render("job-details", { job });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to load job");
  }
});

// ====================
// Job API Routes
// ====================

app.get("/api/jobs", async (req, res) => {
  try {
    const cachedJobs = await redis.get("jobs:all");

    if (cachedJobs) {
      console.log("Jobs loaded from Redis cache");
      return res.json(JSON.parse(cachedJobs));
    }

    const jobs = await Job.find();

    console.log("Jobs loaded from MongoDB");

    await redis.set("jobs:all", JSON.stringify(jobs), "EX", 60);

    res.json(jobs);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch jobs",
    });
  }
});

app.get(
  "/api/recruiter/jobs",
  authMiddleware,
  recruiterMiddleware,
  async (req, res) => {
    try {
      const jobs = await Job.find({
        recruiter: req.user.userId,
      });

      res.json(jobs);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Failed to fetch recruiter jobs",
      });
    }
  },
);

app.get(
  "/api/recruiter/applications",
  authMiddleware,
  recruiterMiddleware,
  async (req, res) => {
    try {
      const jobs = await Job.find({
        recruiter: req.user.userId,
      }).select("_id");

      const jobIds = jobs.map((job) => job._id);

      const applications = await Application.find({
        job: { $in: jobIds },
      })
        .populate("job", "title company")
        .sort({ createdAt: -1 });

      res.json(applications);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Failed to fetch recruiter applications",
      });
    }
  },
);

app.get("/api/jobs/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const job = await Job.findOne({ id: id });

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    res.json(job);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch job",
    });
  }
});

// ====================
// Recruiter Job API
// ====================

app.post("/api/jobs", authMiddleware, recruiterMiddleware, async (req, res) => {
  try {
    const lastJob = await Job.findOne().sort({ id: -1 });
    const nextId = lastJob ? lastJob.id + 1 : 1;

    const newJob = new Job({
      id: nextId,
      title: req.body.title,
      company: req.body.company,
      location: req.body.location,
      type: req.body.type,
      category: req.body.category,
      description: req.body.description,
      responsibilities: req.body.responsibilities,
      requirements: req.body.requirements,
      experience: req.body.experience,
      recruiter: req.user.userId,
    });

    await newJob.save();

    // Clear cached jobs after creating a new job
    await redis.del("jobs:all");

    res.status(201).json(newJob);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create job",
    });
  }
});

app.put(
  "/api/jobs/:id",
  authMiddleware,
  recruiterMiddleware,
  async (req, res) => {
    try {
      const jobId = Number(req.params.id);

      const updatedJob = await Job.findOneAndUpdate(
        {
          id: jobId,
          recruiter: req.user.userId,
        },
        {
          title: req.body.title,
          company: req.body.company,
          location: req.body.location,
          type: req.body.type,
          category: req.body.category,
          description: req.body.description,
          responsibilities: req.body.responsibilities,
          requirements: req.body.requirements,
          experience: req.body.experience,
        },
        {
          new: true,
          runValidators: true,
        },
      );

      if (!updatedJob) {
        return res.status(404).json({
          message: "Job not found",
        });
      }

      // Clear cached jobs after updating a job
      await redis.del("jobs:all");

      res.json(updatedJob);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Failed to update job",
      });
    }
  },
);

app.delete(
  "/api/jobs/:id",
  authMiddleware,
  recruiterMiddleware,
  async (req, res) => {
    try {
      const jobId = Number(req.params.id);

      const deletedJob = await Job.findOneAndDelete({
        id: jobId,
        recruiter: req.user.userId,
      });

      if (!deletedJob) {
        return res.status(404).json({
          message: "Job not found",
        });
      }

      // Clear cached jobs after deleting a job
      await redis.del("jobs:all");

      res.json({
        message: "Job deleted successfully",
        job: deletedJob,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Failed to delete job",
      });
    }
  },
);

// ====================
// Recruiter Pages
// ====================

app.get("/recruiter", authMiddleware, recruiterMiddleware, (req, res) => {
  res.render("recruiter-dashboard");
});

app.get("/recruiter/jobs", authMiddleware, recruiterMiddleware, (req, res) => {
  res.render("recruiter-jobs");
});

app.get("/recruiter/post", authMiddleware, recruiterMiddleware, (req, res) => {
  res.render("recruiter-post");
});

app.get(
  "/recruiter/applications",
  authMiddleware,
  recruiterMiddleware,
  (req, res) => {
    res.render("recruiter-applications");
  },
);

// ====================
// Application Route
// ====================

app.post("/apply", applicationLimiter, async (req, res) => {
  try {
    const jobId = req.body.jobId;

    const name = req.body.fullName;

    if (!name || name.trim() === "") {
      return res.send("Please enter your full name.");
    }

    const email = req.body.email;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return res.send("Please enter a valid email address.");
    }

    const phone = req.body.phone;
    const phonePattern = /^\d{10}$/;

    if (!phonePattern.test(phone)) {
      return res.send("Please enter a valid 10-digit phone number.");
    }

    const experience = req.body.experience;

    if (!experience || experience.trim() === "") {
      return res.send("Please select your experience.");
    }

    const portfolio = req.body.portfolio;

    if (portfolio) {
      try {
        new URL(portfolio);
      } catch {
        return res.send("Please enter a valid portfolio URL.");
      }
    }

    const job = await Job.findOne({
      _id: jobId,
    }).populate("recruiter");

    if (!job) {
      return res.send("Job not found.");
    }

    const application = {
      job: jobId,
      name,
      email,
      phone,
      experience,
      portfolio,
      message: req.body.message,
    };

    const savedApplication = await Application.create(application);

    console.log("New application received:", savedApplication);

    // Add the email notification to the background queue
    await emailQueue.add("application-email", {
      applicationId: savedApplication._id.toString(),
      jobId: job._id.toString(),
    });

    console.log("Email job added to queue");

    res.render("success", {
      name,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to submit application.");
  }
});

// ====================
// Start Server
// ====================

app.listen(5000, () => {
  console.log("server is running on port 5000");
});

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

const app = express();


// ====================
// Database Connection
// ====================

connectDB();



// ====================
// Middleware
// ====================

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.set("view engine", "ejs");


// ====================
// Page Routes
// ====================

// Home
app.get("/", (req, res) => {
    res.render("index", {
        jobTitle: "Software Engineer",
        company: "TechNova Solutions",
        location: "Remote",
        description:
            "We are looking for a motivated software engineer to join our development team.",
    });
});


// Apply Page
app.get("/apply", (req, res) => {
    res.render("apply");
});


// Register Page
app.get("/register", (req, res) => {
    res.render("register");
});


// Register User
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

        res.send("Registration successful!");

    } catch (error) {
        console.error(error);

        res.status(500).send("Registration failed");
    }
});


// Login Page
app.get("/login", (req, res) => {
    res.render("login");
});
// Log out
app.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/login");
});


// Login User
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).send("Invalid email or password");
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

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
            }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 60 * 60 * 1000,
        });

        res.send("Login successful!");

    } catch (error) {
        console.error(error);

        res.status(500).send("Login failed");
    }
});



// ====================
// Job API Routes
// ====================


// GET all jobs
app.get("/api/jobs", async (req, res) => {
    try {
        const jobs = await Job.find();

        res.json(jobs);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch jobs",
        });
    }
});


// GET one job
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


// POST new job
// Recruiter only
app.post(
    "/api/jobs",
    authMiddleware,
    recruiterMiddleware,
    async (req, res) => {
        try {

            // Find highest existing job ID
            const lastJob = await Job.findOne().sort({ id: -1 });

            const nextId = lastJob
                ? lastJob.id + 1
                : 1;


            // Create new job
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
            });


            // Save to MongoDB
            await newJob.save();


            res.status(201).json(newJob);

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Failed to create job",
            });
        }
    }
);


// PUT update job
// Recruiter only
app.put(
    "/api/jobs/:id",
    authMiddleware,
    recruiterMiddleware,
    async (req, res) => {
        try {

            const jobId = Number(req.params.id);

            const updatedJob = await Job.findOneAndUpdate(
                { id: jobId },
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
                }
            );


            if (!updatedJob) {
                return res.status(404).json({
                    message: "Job not found",
                });
            }


            res.json(updatedJob);

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Failed to update job",
            });
        }
    }
);


// DELETE job
// Recruiter only
app.delete(
    "/api/jobs/:id",
    authMiddleware,
    recruiterMiddleware,
    async (req, res) => {
        try {

            const jobId = Number(req.params.id);

            const deletedJob = await Job.findOneAndDelete({
                id: jobId,
            });


            if (!deletedJob) {
                return res.status(404).json({
                    message: "Job not found",
                });
            }


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
    }
);


// ====================
// Recruiter Pages
// ====================

app.get(
    "/recruiter",
    authMiddleware,
    recruiterMiddleware,
    (req, res) => {
        res.render("recruiter-dashboard");
    }
);

app.get(
    "/recruiter/post",
    authMiddleware,
    recruiterMiddleware,
    (req, res) => {
        res.render("recruiter");
    }
);

// ====================
// Application Route
// ====================

app.post("/apply", async (req, res) => {

    // Name validation
    const name = req.body.fullName;

    if (!name || name.trim() === "") {
        return res.send("Please enter your full name.");
    }


    // Email validation
    const email = req.body.email;

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        return res.send("Please enter a valid email address.");
    }


    // Phone validation
    const phone = req.body.phone;

    const phonePattern = /^\d{10}$/;

    if (!phonePattern.test(phone)) {
        return res.send("Please enter a valid 10-digit phone number.");
    }


    // Experience validation
    const experience = req.body.experience;

    if (!experience || experience.trim() === "") {
        return res.send("Please select your experience.");
    }


    // Portfolio validation
    const portfolio = req.body.portfolio;

    if (portfolio) {
        try {
            new URL(portfolio);

        } catch {
            return res.send("Please enter a valid portfolio URL.");
        }
    }


    // Create application object
    const application = {
        name: name,
        email: email,
        phone: phone,
        experience: experience,
        portfolio: portfolio,
        message: req.body.message,
    };


    await Application.create(application);

    console.log(
        "New application received:",
        application
    );


    // Show success page
    res.render("success", {
        name: name,
    });
});


// ====================
// Start Server
// ====================

app.listen(5000, () => {
    console.log("server is running on port 5000");
});
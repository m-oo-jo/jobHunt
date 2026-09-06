const express = require("express");

const app = express();

const applications = [];

const jobs = [
    {
        id: 1,
        title: "Software Engineer",
        company: "TechNova Solutions",
        location: "Kochi",
        type: "Full Time",
        category: "Development",
        description:
            "We are looking for a motivated software engineer to join our development team.",
        responsibilities: [
            "Develop and maintain web applications",
            "Work with the development team",
            "Write clean and maintainable code",
        ],
        requirements: [
            "Knowledge of JavaScript",
            "Understanding of web development",
            "Good problem-solving skills",
        ],
        experience: "0–2 years",
    },

    {
        id: 2,
        title: "Frontend Developer",
        company: "PixelCraft Labs",
        location: "Bangalore",
        type: "Part Time",
        category: "Development",
        description:
            "We are looking for a creative frontend developer to build responsive and user-friendly web interfaces.",
        responsibilities: [
            "Build responsive web pages",
            "Work with designers and developers",
            "Improve website performance",
        ],
        requirements: [
            "Knowledge of HTML, CSS and JavaScript",
            "Understanding of responsive design",
            "Basic knowledge of React",
        ],
        experience: "0–2 years",
    },

    {
        id: 3,
        title: "UI/UX Designer",
        company: "Google",
        location: "Chennai",
        type: "Full Time",
        category: "Design",
        description:
            "We are looking for a UI/UX designer to create simple, attractive and user-friendly digital experiences.",
        responsibilities: [
            "Design user interfaces",
            "Create wireframes and prototypes",
            "Work with the development team",
        ],
        requirements: [
            "Knowledge of UI/UX principles",
            "Experience with design tools",
            "Good understanding of user experience",
        ],
        experience: "1–3 years",
    },

    {
        id: 4,
        title: "Backend Developer",
        company: "DataCrunch",
        location: "Delhi",
        type: "Remote",
        category: "Development",
        description:
            "We are looking for a backend developer to build reliable server-side applications and APIs.",
        responsibilities: [
            "Develop REST APIs",
            "Work with databases",
            "Maintain server-side applications",
        ],
        requirements: [
            "Knowledge of Node.js",
            "Understanding of REST APIs",
            "Knowledge of databases",
        ],
        experience: "1–3 years",
    },

    {
        id: 5,
        title: "DevOps Engineer",
        company: "Deloitte Tech",
        location: "Kochi",
        type: "Full Time",
        category: "Operations",
        description:
            "We are looking for a DevOps engineer to help automate development, deployment and infrastructure processes.",
        responsibilities: [
            "Manage deployment pipelines",
            "Work with containers and cloud infrastructure",
            "Monitor application systems",
        ],
        requirements: [
            "Knowledge of Linux",
            "Understanding of Docker",
            "Basic knowledge of CI/CD",
        ],
        experience: "1–3 years",
    },
];

// Middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");

// ====================
// Page Routes
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

app.get("/apply", (req, res) => {
    res.render("apply");
});

app.get("/jobs", (req, res) => {
    res.render("jobs");
});

app.get("/jobs/:id", (req, res) => {
    const jobId = Number(req.params.id);

    const job = jobs.find((job) => job.id === jobId);

    if (!job) {
        return res.status(404).send("Job not found");
    }

    res.render("job-details", {
        job: job,
    });
});

app.get("/recruiter", (req, res) => {
    res.render("recruiter-dashboard");
});

app.get("/recruiter/post", (req, res) => {
    res.render("recruiter");
});

// ====================
// REST API Routes
// ====================

// GET all jobs
app.get("/api/jobs", (req, res) => {
    res.json(jobs);
});

// GET one job
app.get("/api/jobs/:id", (req, res) => {
    const jobId = Number(req.params.id);

    const job = jobs.find((job) => job.id === jobId);

    if (!job) {
        return res.status(404).json({
            message: "Job not found",
        });
    }

    res.json(job);
});

// POST new job
app.post("/api/jobs", (req, res) => {
    const newJob = {
        id: jobs.length? Math.max(...jobs.map((job) => job.id)) + 1: 1,
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        type: req.body.type,
        category: req.body.category,
        description: req.body.description,
        responsibilities: req.body.responsibilities,
        requirements: req.body.requirements,
        experience: req.body.experience,
    };

    jobs.push(newJob);

    res.status(201).json(newJob);
});

// PUT update job
app.put("/api/jobs/:id", (req, res) => {
    const jobId = Number(req.params.id);

    const job = jobs.find((job) => job.id === jobId);

    if (!job) {
        return res.status(404).json({
            message: "Job not found",
        });
    }

    job.title = req.body.title;
    job.company = req.body.company;
    job.location = req.body.location;
    job.type = req.body.type;
    job.category = req.body.category;
    job.description = req.body.description;
    job.responsibilities = req.body.responsibilities;
    job.requirements = req.body.requirements;
    job.experience = req.body.experience;

    res.json(job);
});

// DELETE job
app.delete("/api/jobs/:id", (req, res) => {
    const jobId = Number(req.params.id);

    const jobIndex = jobs.findIndex((job) => job.id === jobId);

    if (jobIndex === -1) {
        return res.status(404).json({
            message: "Job not found",
        });
    }

    const deletedJob = jobs.splice(jobIndex, 1);

    res.json({
        message: "Job deleted successfully",
        job: deletedJob[0],
    });
});

// ====================
// Application Route
// ====================

app.post("/apply", (req, res) => {

    // Name validation
    const name = req.body.fullName;

    if (!name || name.trim() === "") {
        return res.send("Please enter your full name.");
    }

    // Email validation
    const email = req.body.email;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    // Store application
    applications.push(application);

    console.log("New application received:", application);

    // Show success page
    res.render("success", {
        name: name,
    });
});

// Start server
app.listen(5000, () => {
    console.log("server is running on port 5000");
});
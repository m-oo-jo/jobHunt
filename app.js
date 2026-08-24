const express = require("express");
const app = express();
const applications = [];
app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

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
app.post("/apply", (req, res) => {
  //name validation
  const name = req.body.fullName;
  if (!name || name.trim() === "") {
    return res.send("Please enter your full name.");
  }

  //email validation
  const email = req.body.email;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    return res.send("Please enter a valid email address.");
  }

  //phone validation
  const phone = req.body.phone;
  const phonePattern = /^\d{10}$/;

  if (!phonePattern.test(phone)) {
    return res.send("Please enter a valid 10-digit phone number.");
  }

  //experience validation
  const experience = req.body.experience;

  if (!experience || experience.trim() === "") {
    return res.send("Please select your experience.");
  }

  //portfolio validation
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
    message: req.body.message
};


// Store application in the applications array
applications.push(application);
console.log("New application received:", application);


//show success page
  res.render("success", {
    name: name,
  });
});

app.listen(5000, () => {
  console.log("server is running on port 5000");
});

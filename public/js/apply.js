function initApplyValidation() {
  const form = document.querySelector("form");

  if (!form) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const jobId = params.get("jobId");

  if (jobId) {
    document.getElementById("jobId").value = jobId;
  }

  const fullNameInput = document.getElementById("fullName");
  const fullNameError = document.getElementById("fullNameError");

  const emailInput = document.getElementById("email");
  const emailError = document.getElementById("emailError");

  const messageInput = document.getElementById("message");
  const messageCount = document.getElementById("messageCount");
  const messageError = document.getElementById("messageError");

  const phoneInput = document.getElementById("phone");
  const phoneError = document.getElementById("phoneError");

  const experienceInput = document.getElementById("experience");
  const experienceError = document.getElementById("experienceError");

  const portfolioInput = document.getElementById("portfolio");
  const portfolioError = document.getElementById("portfolioError");

  // Full Name live validation
  fullNameInput.addEventListener("input", function () {
    const fullName = fullNameInput.value.trim();

    if (fullName.length < 3) {
      fullNameError.textContent =
        "Full name must contain at least 3 characters.";
    } else if (!/^[A-Za-z ]+$/.test(fullName)) {
      fullNameError.textContent =
        "Full name can only contain letters and spaces.";
    } else {
      fullNameError.textContent = "";
    }
  });

  // Email live validation
  emailInput.addEventListener("input", function () {
    const email = emailInput.value.trim();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      emailError.textContent = "Please enter a valid email address.";
    } else {
      emailError.textContent = "";
    }
  });

  // Message character counter
  messageInput.addEventListener("input", function () {
    const messageLength = messageInput.value.length;

    messageCount.textContent = messageLength + " / 20 characters";
  });

  // Final form validation
  form.addEventListener("submit", function (event) {
    // Name
    const fullName = fullNameInput.value.trim();

    if (fullName.length < 3) {
      event.preventDefault();

      fullNameError.textContent =
        "Full name must contain at least 3 characters.";

      return;
    }

    if (!/^[A-Za-z ]+$/.test(fullName)) {
      event.preventDefault();

      fullNameError.textContent =
        "Full name can only contain letters and spaces.";

      return;
    }

    // Email
    const email = emailInput.value.trim();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      event.preventDefault();

      emailError.textContent = "Please enter a valid email address.";

      return;
    }

    // Phone
    const phone = phoneInput.value.trim();

    const phonePattern = /^[0-9]{10}$/;

    if (!phonePattern.test(phone)) {
      event.preventDefault();

      phoneError.textContent = "Please enter a valid 10-digit phone number.";

      return;
    }

    // Experience
    const experience = experienceInput.value;

    if (experience === "") {
      event.preventDefault();

      experienceError.textContent = "Please select your experience level.";

      return;
    }

    // Portfolio
    const portfolio = portfolioInput.value.trim();

    const portfolioPattern = /^https?:\/\/.+$/;

    if (portfolio !== "" && !portfolioPattern.test(portfolio)) {
      event.preventDefault();

      portfolioError.textContent =
        "Please enter a valid portfolio URL starting with http:// or https://.";

      return;
    }

    // Message
    const message = messageInput.value.trim();

    if (message.length < 20) {
      event.preventDefault();

      messageError.textContent = "Message must contain at least 20 characters.";

      return;
    }
  });
}

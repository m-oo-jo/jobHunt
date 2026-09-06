function initRecruiter() {
  const jobForm = document.getElementById("jobForm");

  if (!jobForm) return;

  const params = new URLSearchParams(window.location.search);
  const editId = params.get("edit");

  // Load existing job when editing
  if (editId) {
    fetch(`/api/jobs/${editId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load job");
        }

        return response.json();
      })
      .then((job) => {
        document.getElementById("title").value = job.title;
        document.getElementById("company").value = job.company;
        document.getElementById("location").value = job.location;
        document.getElementById("type").value = job.type;
        document.getElementById("category").value = job.category;
        document.getElementById("description").value = job.description;

        document.getElementById("responsibilities").value =
          job.responsibilities.join("\n");

        document.getElementById("requirements").value =
          job.requirements.join("\n");

        document.getElementById("experience").value = job.experience;
      })
      .catch((error) => {
        console.error("Error loading job:", error);
      });
  }

  jobForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    console.log("Job form submitted");

    const jobData = {
      title: document.getElementById("title").value,
      company: document.getElementById("company").value,
      location: document.getElementById("location").value,
      type: document.getElementById("type").value,
      category: document.getElementById("category").value,
      description: document.getElementById("description").value,

      responsibilities: document
        .getElementById("responsibilities")
        .value.split("\n")
        .filter((item) => item.trim() !== ""),

      requirements: document
        .getElementById("requirements")
        .value.split("\n")
        .filter((item) => item.trim() !== ""),

      experience: document.getElementById("experience").value,
    };

    let response;

    // Update existing job
    if (editId) {
      response = await fetch(`/api/jobs/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobData),
      });
    }

    // Create new job
    else {
      response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobData),
      });
    }

    const result = await response.json();

    console.log(result);

    if (!response.ok) {
      console.error("Failed to save job");
      return;
    }

    // Return to recruiter dashboard
    window.location.href = "/recruiter";
  });
}

function initRecruiterDashboard() {
  const recruiterJobs = document.getElementById("recruiterJobs");

  if (!recruiterJobs) return;

  fetch("/api/jobs")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      return response.json();
    })
    .then((jobs) => {
      recruiterJobs.innerHTML = "";

      document.getElementById("jobsCount").textContent = jobs.length;
      document.getElementById("activeJobsCount").textContent = jobs.length;
      jobs.forEach((job) => {
        const jobCard = document.createElement("div");

        jobCard.className = "job-list-card mb-3";

        jobCard.innerHTML = `
          <div>
            <h4>${job.title}</h4>

            <p class="job-company">
              ${job.company}
            </p>

            <small>
              📍 ${job.location}
              &nbsp; • &nbsp;
              ${job.type}
              &nbsp; • &nbsp;
              ${job.category}
            </small>
          </div>

          <div>
            <a
              href="/recruiter/post?edit=${job.id}"
              class="apply-btn me-2"
            >
              Edit
            </a>

            <button
              class="btn btn-danger"
              data-id="${job.id}"
            >
              Delete
            </button>
          </div>
        `;

        recruiterJobs.appendChild(jobCard);

        const deleteButton = jobCard.querySelector("button");

        deleteButton.addEventListener("click", async function () {
          const jobId = this.dataset.id;

          const confirmed = confirm(
            "Are you sure you want to delete this job?",
          );

          if (!confirmed) {
            return;
          }

          const response = await fetch(`/api/jobs/${jobId}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            console.error("Failed to delete job");
            return;
          }

          jobCard.remove();

          const remainingJobs = document.querySelectorAll(
            "#recruiterJobs .job-list-card",
          ).length;

          document.getElementById("jobsCount").textContent = remainingJobs;
          document.getElementById("activeJobsCount").textContent =
            remainingJobs;
        });
      });
    })
    .catch((error) => {
      console.error("Error loading jobs:", error);

      recruiterJobs.innerHTML = `
        <p>Unable to load jobs.</p>
      `;
    });
}

if (document.getElementById("jobForm")) {
  initRecruiter();
}

if (document.getElementById("recruiterJobs")) {
  initRecruiterDashboard();
}

function initJobs() {
  let allJobs = [];

  const searchInput = document.getElementById("search");
  const jobsContainer = document.getElementById("jobsContainer");

  const categoryFilter = document.getElementById("category");
  const locationFilter = document.getElementById("location");

  const fullTimeFilter = document.getElementById("fullTime");
  const partTimeFilter = document.getElementById("partTime");
  const remoteFilter = document.getElementById("remote");
  const sortFilter = document.getElementById("sort");


  // Display jobs on the page
  function displayJobs(jobs) {
    jobsContainer.innerHTML = "";

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
            📍 ${job.location} &nbsp; • &nbsp; ${job.type}
          </small>
        </div>

        <a
          href="/jobs/${job.id}"
          class="apply-btn"
        >
          View Job
        </a>
      `;

      jobsContainer.appendChild(jobCard);
    });
  }


  // Apply all filters
  function applyFilters() {
    const searchText = searchInput.value.toLowerCase();

    const selectedCategory = categoryFilter.value;

    const selectedLocation = locationFilter.value;


    // Get selected job types
    const selectedTypes = [];

    if (fullTimeFilter.checked) {
      selectedTypes.push("Full Time");
    }

    if (partTimeFilter.checked) {
      selectedTypes.push("Part Time");
    }

    if (remoteFilter.checked) {
      selectedTypes.push("Remote");
    }


    // Filter jobs
    const filteredJobs = allJobs.filter((job) => {

      const matchesSearch =
        job.title.toLowerCase().includes(searchText);


      const matchesCategory =
        selectedCategory === "All Categories" ||
        job.category === selectedCategory;


      const matchesLocation =
        selectedLocation === "All Locations" ||
        job.location === selectedLocation;


      // If no job type is selected, show all types
      const matchesType =
        selectedTypes.length === 0 ||
        selectedTypes.includes(job.type) ||
        (remoteFilter.checked && job.location === "Remote");


      return (
        matchesSearch &&
        matchesCategory &&
        matchesLocation &&
        matchesType
      );
    });


    displayJobs(filteredJobs);
  }


  // Search filter
  searchInput.addEventListener("input", () => {
    applyFilters();
  });


  // Category filter
  categoryFilter.addEventListener("change", () => {
    applyFilters();
  });


  // Location filter
  locationFilter.addEventListener("change", () => {
    applyFilters();
  });


  // Full Time filter
  fullTimeFilter.addEventListener("change", () => {
    applyFilters();
  });


  // Part Time filter
  partTimeFilter.addEventListener("change", () => {
    applyFilters();
  });


  // Remote filter
  remoteFilter.addEventListener("change", () => {
    applyFilters();
  });

  // Reset filters
const resetButton = document.querySelector(".filter-card button");

resetButton.addEventListener("click", () => {
  searchInput.value = "";
  categoryFilter.value = "All Categories";
  locationFilter.value = "All Locations";

  fullTimeFilter.checked = false;
  partTimeFilter.checked = false;
  remoteFilter.checked = false;

  displayJobs(allJobs);
});

// Sort jobs
sortFilter.addEventListener("change", () => {
  if (sortFilter.value === "Sort by: Newest") {
    allJobs.sort((a, b) => b.id - a.id);
  }

  if (sortFilter.value === "Sort by: Oldest") {
    allJobs.sort((a, b) => a.id - b.id);
  }

  applyFilters();
});


  // Fetch jobs from API
  fetch("/api/jobs")
    .then((response) => response.json())
    .then((jobs) => {
      allJobs = jobs;

      displayJobs(allJobs);
    });
}


// Initialize Jobs page when it is loaded directly
if (document.getElementById("jobsContainer")) {
  initJobs();
}
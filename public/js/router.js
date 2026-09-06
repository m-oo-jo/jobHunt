document.addEventListener("click", async function (event) {
  const link = event.target.closest("a");

  if (!link) {
    return;
  }

  if (link.target === "_blank") {
    return;
  }

  if (link.origin !== window.location.origin) {
    return;
  }

  event.preventDefault();

  const url = link.href;

  await loadPage(url, true);
});


async function loadPage(url, addToHistory) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Page could not be loaded");
    }

    const html = await response.text();

    const parser = new DOMParser();

    const newDocument = parser.parseFromString(html, "text/html");

    const newContent = newDocument.getElementById("app-content");

    if (!newContent) {
      window.location.href = url;
      return;
    }

    document.getElementById("app-content").replaceWith(newContent);

    if (addToHistory) {
      history.pushState({}, "", url);
    }

    initializePage(url);

  } catch (error) {
    console.error("Routing error:", error);

    window.location.href = url;
  }
}


function initializePage(url) {

  if (url.includes("/apply")) {
    initApplyValidation();
  }

  if (url.includes("/jobs")) {
    initJobs();
  }

  if (url.includes("/recruiter")) {
    initRecruiter();
    initRecruiterDashboard();
  }

}


window.addEventListener("popstate", function () {
  loadPage(window.location.href, false);
});


initializePage(window.location.href);
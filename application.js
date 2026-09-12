const applicationForm = document.getElementById("applicationForm");
const formStatus = document.getElementById("formStatus");
const submitButton = applicationForm.querySelector("button[type=submit]");
const params = new URLSearchParams(window.location.search);
const caseIdField = applicationForm.elements.caseId;
const projectIdField = applicationForm.elements.projectId;
const opportunityTypeField = applicationForm.elements.type;
const opportunityName = document.getElementById("opportunityName");

const projects = {
  "project-enterprise-ai": "Enterprise AI Challenge",
  "project-realtime-analytics": "Real-Time Analytics Dashboard",
  "project-developer-productivity": "Developer Productivity Tool",
  "project-support-ai": "Customer Support AI Assistant",
  "project-enterprise-migration": "Enterprise Data Migration"
};

if (caseIdField) {
  caseIdField.value = params.get("caseId") || "case-payment-scaling";
}

if (projectIdField) {
  projectIdField.value = params.get("projectId") || "";
}

if (opportunityTypeField && params.get("type")) {
  opportunityTypeField.value = params.get("type");
}

if (opportunityName && projectIdField) {
  const projectName = projects[projectIdField.value];
  opportunityName.textContent = projectName || "Project application";
  applicationForm.elements.project.value = projectName || "";
}

applicationForm.addEventListener("submit", async event => {
  event.preventDefault();
  submitButton.disabled = true;
  formStatus.className = "form-status";
  formStatus.textContent = "Submitting...";

  const formData = new FormData(applicationForm);
  const submission = Object.fromEntries(formData.entries());
  submission.submittedAt = new Date().toISOString();

  try {
    const response = await fetch(
      "https://tale.nestyinconnect.workers.dev/submit",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(submission)
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || `Request failed with status ${response.status}`);
    }

    applicationForm.reset();
    formStatus.className = "form-status success";
    formStatus.textContent = "Your solution was submitted successfully.";
  } catch (error) {
    console.error("Application submission failed:", error);
    formStatus.className = "form-status error";
    formStatus.textContent = "We could not submit your solution. Please check your links and try again.";
  } finally {
    submitButton.disabled = false;
  }
});

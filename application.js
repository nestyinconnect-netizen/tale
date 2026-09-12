const applicationForm = document.getElementById("applicationForm");
const formStatus = document.getElementById("formStatus");
const submitButton = applicationForm.querySelector("button[type=submit]");

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
      "https://test.nestyinconnect.workers.dev/submit",
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

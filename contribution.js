const contributionForm = document.getElementById("contributionForm");
const contributionStatus = document.getElementById("contributionStatus");
const contributionButton = contributionForm.querySelector("button[type=submit]");

contributionForm.addEventListener("submit", async event => {
  event.preventDefault();
  contributionButton.disabled = true;
  contributionStatus.className = "form-status";
  contributionStatus.textContent = "Submitting contribution...";

  const formData = new FormData(contributionForm);
  const submission = Object.fromEntries(formData.entries());
  submission.type = "case_study_contribution";
  submission.submittedAt = new Date().toISOString();

  try {
    const response = await fetch("https://tale.nestyinconnect.workers.dev/contribute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(submission)
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || `Request failed with status ${response.status}`);
    }

    contributionForm.reset();
    contributionStatus.className = "form-status success";
    contributionStatus.textContent = "Thank you. Your case study contribution was sent for review.";
  } catch (error) {
    console.error("Case study contribution failed:", error);
    contributionStatus.className = "form-status error";
    contributionStatus.textContent = "We could not submit your contribution. Please try again later.";
  } finally {
    contributionButton.disabled = false;
  }
});

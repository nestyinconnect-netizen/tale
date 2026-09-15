const messageForm = document.getElementById("messageForm");
const messageStatus = document.getElementById("messageStatus");
const messageButton = document.getElementById("messageButton");
const messageTypeField = document.getElementById("messageType");
const messageLabel = document.getElementById("messageLabel");
const messageTitle = document.getElementById("messageTitle");
const messageIntro = document.getElementById("messageIntro");
const messageSubject = document.getElementById("messageSubject");
const params = new URLSearchParams(window.location.search);
const isFeedback = params.get("type") === "feedback";

if (isFeedback) {
  messageTypeField.value = "feedback";
  messageLabel.textContent = "FEEDBACK";
  messageTitle.textContent = "Share Feedback";
  messageIntro.textContent = "Tell us what is working, what needs improvement, or what you would like to see next.";
  messageSubject.value = "Platform feedback";
  messageSubject.placeholder = "e.g. Feedback about case-study evaluation";
  messageButton.textContent = "Send Feedback";
}

messageForm.addEventListener("submit", async event => {
  event.preventDefault();
  messageButton.disabled = true;
  messageStatus.className = "form-status";
  messageStatus.textContent = "Sending...";

  const formData = new FormData(messageForm);
  const submission = Object.fromEntries(formData.entries());
  submission.submittedAt = new Date().toISOString();

  try {
    const response = await fetch("https://tale.nestyinconnect.workers.dev/message", {
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

    messageForm.reset();
    messageTypeField.value = isFeedback ? "feedback" : "contact";
    messageStatus.className = "form-status success";
    messageStatus.textContent = isFeedback
      ? "Thank you. Your feedback was sent successfully."
      : "Your message was sent successfully.";
  } catch (error) {
    console.error("Message submission failed:", error);
    messageStatus.className = "form-status error";
    messageStatus.textContent = "We could not send your message. Please try again later.";
  } finally {
    messageButton.disabled = false;
  }
});

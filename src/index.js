export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    if (request.method === "POST" && url.pathname === "/submit") {
      try {
        const data = await request.json();

        if (!data.caseId && !data.projectId) {
          return jsonResponse({
            success: false,
            message: "A caseId or projectId is required."
          }, 400, corsHeaders);
        }

        if (!env.RESEND_API_KEY) {
          return jsonResponse({
            success: false,
            message: "RESEND_API_KEY is missing."
          }, 500, corsHeaders);
        }

        if (!env.COORDINATOR_EMAIL) {
          return jsonResponse({
            success: false,
            message: "COORDINATOR_EMAIL is missing."
          }, 500, corsHeaders);
        }

        const opportunityType = getOpportunityType(data);
        const opportunityId = data.caseId || data.projectId;
        const opportunityLabel = data.caseId ? "Case Study" : "Project";
        const submittedAt = data.submittedAt || new Date().toISOString();
        const emailHtml = `
          <h2>Nestyin Connect - New Application</h2>
          <p><strong>Type:</strong> ${escapeHtml(opportunityType)}</p>
          <p><strong>${opportunityLabel}:</strong> ${escapeHtml(data.project || "")}</p>
          <p><strong>${opportunityLabel} ID:</strong> ${escapeHtml(opportunityId)}</p>
          <hr>
          <h3>Applicant</h3>
          <p><strong>Name:</strong> ${escapeHtml(data.name || "")}</p>
          <p><strong>Email:</strong> ${escapeHtml(data.email || "")}</p>
          <p><strong>Phone:</strong> ${escapeHtml(data.phone || "")}</p>
          <p><strong>Experience:</strong> ${escapeHtml(data.experience || "")}</p>
          <p><strong>Company:</strong> ${escapeHtml(data.company || "")}</p>
          <p><strong>Skills:</strong> ${escapeHtml(formatSkills(data.skills))}</p>
          <hr>
          <h3>Documents</h3>
          <p><strong>Resume:</strong> ${linkHtml(data.resume)}</p>
          <p><strong>Solution:</strong> ${linkHtml(data.solution)}</p>
          <hr>
          <p><strong>Submitted:</strong> ${escapeHtml(submittedAt)}</p>
        `;

        const resendResponse = await fetch(
          "https://api.resend.com/emails",
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${env.RESEND_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              from: env.RESEND_FROM_EMAIL || "Nestyin Connect <onboarding@resend.dev>",
              to: [env.COORDINATOR_EMAIL],
              subject: `Nestyin Connect - ${opportunityType} - ${opportunityId}`,
              html: emailHtml
            })
          }
        );

        const resendText = await resendResponse.text();
        console.log("Resend status:", resendResponse.status);

        if (!resendResponse.ok) {
          return jsonResponse({
            success: false,
            message: "Resend rejected the email.",
            resendStatus: resendResponse.status,
            resendResponse: resendText
          }, 500, corsHeaders);
        }

        return jsonResponse({
          success: true,
          message: "Submission received and email sent.",
          resend: resendText
        }, 200, corsHeaders);
      } catch (error) {
        console.error(error);
        return jsonResponse({
          success: false,
          message: "Worker error.",
          error: error.message
        }, 500, corsHeaders);
      }
    }

    if (request.method === "GET" && env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return jsonResponse({
      success: false,
      message: "Not found"
    }, 404, corsHeaders);
  }
};

function jsonResponse(data, status, corsHeaders) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    }
  );
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getOpportunityType(data) {
  if (data.caseId || data.type === "case_study") {
    return "Case Study";
  }

  if (data.type === "private") {
    return "Private Project";
  }

  return "Public Project";
}

function formatSkills(skills) {
  return Array.isArray(skills) ? skills.join(", ") : skills || "";
}

function linkHtml(value) {
  const link = String(value || "");

  if (!/^https?:\/\//i.test(link)) {
    return escapeHtml(link);
  }

  const escapedLink = escapeHtml(link);
  return `<a href="${escapedLink}">${escapedLink}</a>`;
}

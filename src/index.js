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

        const emailHtml = `
          <h2>Nestyin Connect - Test Submission</h2>
          <p>A test submission was received successfully.</p>
          <hr>
          <p><strong>Name:</strong> ${escapeHtml(data.name || "Test User")}</p>
          <p><strong>Email:</strong> ${escapeHtml(data.email || "test@example.com")}</p>
          <p><strong>Experience:</strong> ${escapeHtml(data.experience || "5 years")}</p>
          <p><strong>Company:</strong> ${escapeHtml(data.company || "Microsoft")}</p>
          <p><strong>Resume:</strong> ${escapeHtml(data.resume || "https://drive.google.com/test")}</p>
          <p><strong>Solution:</strong> ${escapeHtml(data.solution || "https://1drv.ms/test")}</p>
          <hr>
          <p><strong>Submitted:</strong> ${new Date().toISOString()}</p>
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
              from: "Nestyin Connect <onboarding@resend.dev>",
              to: [env.COORDINATOR_EMAIL],
              subject: "Nestyin Connect - Test Submission",
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

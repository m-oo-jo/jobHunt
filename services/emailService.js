const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendApplicationEmail(application, job) {
  try {
    const { data, error } = await resend.emails.send({
      from: "J]obHunt <onboarding@resend.dev>",
      // Send the notification to the recruiter who owns the job
      to: [job.recruiter.email],
      subject: `New application for ${job.title}`,
      html: `
        <h2>New Job Application</h2>

        <p><strong>Job:</strong> ${job.title}</p>
        <p><strong>Applicant:</strong> ${application.name}</p>
        <p><strong>Email:</strong> ${application.email}</p>
        <p><strong>Phone:</strong> ${application.phone}</p>
        <p><strong>Experience:</strong> ${application.experience}</p>
        <p><strong>Portfolio:</strong> ${application.portfolio || "Not provided"}</p>
        <p><strong>Message:</strong> ${application.message || "No message"}</p>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return false;
    }

    console.log("Application email sent:", data.id);
    return true;
  } catch (error) {
    console.error("Email service error:", error);
    return false;
  }
}

module.exports = sendApplicationEmail;

import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config(); // Load .env variables

// Set the API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Define the email content
const msg = {
  to: "brucechafe@gmail.com", // Change to your recipient
  from: "noreply@baxter-projects.com", // Verified sender
  subject: "Hello from SendGrid",
  text: "This is a test email sent using SendGrid.",
  html: "<strong>This is a test email sent using SendGrid.</strong>",
};

// Send the email
sgMail
  .send(msg)
  .then(() => {
  })
  .catch((error) => {
    console.error("Error sending email:", error.response?.body || error.message);
  });

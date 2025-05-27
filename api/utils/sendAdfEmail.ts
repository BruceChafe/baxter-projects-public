import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

const sendAdfEmail = async () => {
  const adfXml = `<?xml version="1.0"?>
<adf>
    <prospect>
        <requestdate>2025-02-08T12:34:56</requestdate>
        <status>New</status>
        <vehicle>
            <year>2023</year>
            <make>Toyota</make>
            <model>Camry</model>
            <vin>1HGCM82633A123456</vin>
        </vehicle>
        <customer>
            <contact>
                <name part="full">John Doe</name>
                <email>johndoe@email.com</email>
                <phone>555-123-4567</phone>
            </contact>
        </customer>
        <vendor>
            <vendorname>Cars.com</vendorname>
        </vendor>
    </prospect>
</adf>`;

  const msg = {
    to: "leads@baxter-projects.com", // SendGrid Inbound Parse address
    from: "no-reply@baxter-projects.com", // Must be verified in SendGrid
    subject: "New ADF Lead - Toyota Camry",
    text: adfXml, // ADF XML as plain text
    html: `<pre>${adfXml}</pre>`, // Also send in HTML for readability
  };

  try {
    await sgMail.send(msg);
    console.log("ADF Email sent successfully");
  } catch (error) {
    console.error("Error sending ADF Email:", error);
  }
};

export default sendAdfEmail;

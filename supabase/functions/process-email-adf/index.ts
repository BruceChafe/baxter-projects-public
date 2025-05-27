import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { parseStringPromise } from "https://esm.sh/xml2js";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);

const supabaseService = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

// Generate a hash for lead deduplication
async function generateLeadHash(leadData: any): Promise<string> {
  const hashInput = `${leadData.customer?.name?.first || ""}-${
    leadData.customer?.name?.last || ""
  }-${leadData.customer?.email || ""}-${leadData.customer?.phone || ""}-${
    leadData.vehicle?.year || ""
  }-${leadData.vehicle?.make || ""}-${leadData.vehicle?.model || ""}`;
  
  const encoder = new TextEncoder();
  const data = encoder.encode(hashInput);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Function to check if a lead is a duplicate
async function isDuplicateLead(leadHash: string): Promise<boolean> {
  try {
    // First check in processed_leads table
    const { data: processedLead, error: hashError } = await supabase
      .from("processed_leads")
      .select("id")
      .eq("lead_hash", leadHash)
      .maybeSingle();
    
    if (hashError) {
      console.error("Error checking processed_leads:", hashError);
      // Continue and do a fallback check
    } else if (processedLead) {
      console.log("Found exact duplicate by hash:", processedLead.id);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error in duplicate check:", error);
    return false; // In case of error, proceed (better to risk duplicate than miss a lead)
  }
}

// Function to record a processed lead
async function recordProcessedLead(leadHash: string, leadId: string, adfData: any): Promise<void> {
  try {
    const { error } = await supabase
      .from("processed_leads")
      .insert([{
        lead_hash: leadHash,
        lead_id: leadId,
        processed_at: new Date().toISOString(),
        adf_data: JSON.stringify(adfData)
      }]);
    
    if (error) {
      console.error("Failed to record processed lead:", error);
    }
  } catch (error) {
    console.error("Error recording processed lead:", error);
  }
}

// Function to send email using SendGrid
const sendEmail = async (
  to: string,
  subject: string,
  templateData: Record<string, string>
) => {
  try {
    const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
    const SENDER_EMAIL = Deno.env.get("SENDER_EMAIL");
    const TEMPLATE_ID = Deno.env.get("SENDGRID_TEMPLATE_ID");

    console.log("Email config:", {
      hasApiKey: !!SENDGRID_API_KEY,
      hasSenderEmail: !!SENDER_EMAIL,
      hasTemplateId: !!TEMPLATE_ID,
    });

    if (!SENDGRID_API_KEY || !SENDER_EMAIL || !TEMPLATE_ID) {
      throw new Error("Missing SendGrid environment variables.");
    }

    const emailData = {
      personalizations: [
        {
          to: [{ email: to }],
          dynamic_template_data: templateData,
        },
      ],
      from: { email: SENDER_EMAIL },
      template_id: TEMPLATE_ID,
    };

    console.log(`Sending email to ${to} with subject: ${subject}`);

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to send email: ${error}`);
    }

    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error("Error in sendEmail function:", error);
    // Don't throw here, just log the error and continue
    return false;
  }
};

// Function to update the contact with lead details
const updateContactWithLead = async (
  contact_id: string,
  lead_id: string,
  dealership_id: string,
  dealergroup_id: string
) => {
  try {
    console.log("Updating contact with lead:", {
      contact_id,
      lead_id,
      dealership_id,
      dealergroup_id,
    });

    // First check if contact exists
    const { data: contactData, error: fetchError } = await supabase
      .from("contacts")
      .select("*")
      .eq("id", contact_id)
      .single();

    if (fetchError) {
      console.error("Error fetching contact:", fetchError);
      throw fetchError;
    }

    console.log("Existing contact data:", contactData);

    // Ensure leads is an array
    const currentLeads = Array.isArray(contactData.leads)
      ? contactData.leads
      : [];

    // Check if lead already exists in the array
    if (currentLeads.includes(lead_id)) {
      console.log("Lead already associated with contact, skipping update");
      return contactData;
    }

    const updatedContact = {
      ...contactData,
      leads: [...currentLeads, lead_id],
      dealership_id,
      dealergroup_id,
      updated_at: new Date().toISOString()
    };

    console.log("Updating contact with data:", updatedContact);

    const { data: updatedData, error: updateError } = await supabase
      .from("contacts")
      .update(updatedContact)
      .eq("id", contact_id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating contact:", updateError);
      throw updateError;
    }
    console.log("Contact updated successfully:", updatedData);
    return updatedData;
  } catch (error) {
    console.error("Error updating contact:", error);
    throw error;
  }
};

// Helper function to extract ADF XML from multipart email body
function extractAdfXml(body: string): string | null {
  try {
    console.log("Attempting to extract ADF XML from body length:", body.length);
    
    // Look for the ADF XML pattern
    const match = body.match(/<adf>[\s\S]*?<\/adf>/i);
    if (match) {
      console.log("Found ADF XML match");
      return match[0];
    } else {
      console.log("No ADF XML match found in email body");
      return null;
    }
  } catch (error) {
    console.error("Error extracting ADF XML:", error);
    return null;
  }
}

// Serve function
serve(async (req) => {
  try {
    console.log("Incoming request:", { method: req.method, url: req.url });

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Read raw email content
    let rawBody;
    try {
      rawBody = await req.text();
      console.log("Raw request body length:", rawBody.length);
      console.log(
        "Raw request body preview:",
        rawBody.substring(0, 200) + "..."
      );
    } catch (error) {
      console.error("Error reading request body:", error);
      return new Response(
        JSON.stringify({
          error: "Error reading request body",
          details: error.message,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if the body is valid
    if (!rawBody || rawBody.trim() === "") {
      console.error("Empty request body");
      return new Response(JSON.stringify({ error: "Empty request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Extract ADF XML
    const adfXml = extractAdfXml(rawBody);
    if (!adfXml) {
      console.error("No ADF XML found in email body");
      return new Response(
        JSON.stringify({
          error: "No ADF XML found",
          bodySnippet: rawBody.substring(0, 1000),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("Extracted ADF XML length:", adfXml.length);

    // Parse ADF XML
    let result, adf;
    try {
      result = await parseStringPromise(adfXml, { explicitArray: false });
      adf = result.adf;

      if (!adf?.prospect) {
        console.error("Invalid ADF format - missing prospect field");
        return new Response(
          JSON.stringify({
            error: "Invalid ADF format - missing prospect field",
            adfData: JSON.stringify(adf),
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    } catch (error) {
      console.error("Error parsing ADF XML:", error);
      return new Response(
        JSON.stringify({
          error: "Error parsing ADF XML",
          details: error.message,
          adfXml: adfXml.substring(0, 500) + "...",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Extract ADF data
    const customer = adf.prospect.customer?.contact;
    const vehicle = adf.prospect.vehicle;
    const vendor = adf.prospect.vendor;
    const provider = adf.prospect.provider;

    console.log("Extracted ADF data:", {
      hasCustomer: !!customer,
      hasVehicle: !!vehicle,
      hasVendor: !!vendor,
    });

    if (!customer || !vehicle || !vendor) {
      console.error("Missing required ADF fields");
      return new Response(
        JSON.stringify({
          error: "Missing required ADF fields",
          customerFound: !!customer,
          vehicleFound: !!vehicle,
          vendorFound: !!vendor,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Generate a hash of the lead data for deduplication
    const leadHash = await generateLeadHash({
      customer,
      vehicle,
      vendor
    });
    console.log("Generated lead hash:", leadHash);
    
    // Check if this is a duplicate lead
    const isDuplicate = await isDuplicateLead(leadHash);
    if (isDuplicate) {
      console.log("Duplicate lead detected, skipping processing");
      return new Response(
        JSON.stringify({
          message: "Lead already processed",
          hash: leadHash
        }),
        { 
          status: 200, 
          headers: { "Content-Type": "application/json" } 
        }
      );
    }

    // Find the dealership
    let dealership_name;
    try {
      dealership_name = vendor.name ? vendor.name.trim() : "";
      console.log(`Searching for dealership: "${dealership_name}"`);

      if (!dealership_name) {
        return new Response(
          JSON.stringify({ error: "Empty dealership name" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    } catch (error) {
      console.error("Error processing vendor name:", error);
      return new Response(
        JSON.stringify({
          error: "Error processing vendor name",
          details: error.message,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { data: dealershipsMatched, error: dealershipError } =
    await supabaseService
      .from("dealerships")
      .select("*")
      .like("dealership_name", `%${dealership_name}%`)
      .limit(1);
  
    const dealershipData = dealershipsMatched?.[0];

    if (dealershipError || !dealershipData) {
      console.error(
        `Dealership not found: "${dealership_name}"`,
        dealershipError
      );
      
      // For more helpful debugging, get all dealerships
      const { data: allDealerships } = await supabaseService
        .from("dealerships")
        .select("dealership_name");
      
      return new Response(
        JSON.stringify({
          error: `Dealership "${dealership_name}" not found.`,
          dealershipError: dealershipError ? dealershipError.message : null,
          availableDealerships: allDealerships?.map(d => d.dealership_name),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Begin a transaction
    // Note: If Supabase client doesn't support transactions directly, we'll use careful error handling
    
    // Insert new contact
    let newContact, contactError;
    try {
      const contactResponse = await supabase
        .from("contacts")
        .insert([
          {
            first_name: customer.name?.first || "Unknown",
            last_name: customer.name?.last || "Unknown",
            primary_email: customer.email || null,
            mobile_phone: customer.phone || null,
            street_address: customer.address?.street || null,
            city: customer.address?.city || null,
            province: customer.address?.regioncode || null,
            postal_code: customer.address?.postal_code || null,
            country: customer.address?.country || null,
            preferred_contact: customer.email ? "email" : (customer.phone ? "phone" : "email"),
            leads: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      newContact = contactResponse.data;
      contactError = contactResponse.error;

      console.log("Contact creation result:", {
        success: !!newContact,
        error: contactError ? contactError.message : "None",
      });
    } catch (error) {
      console.error("Error creating contact:", error);
      return new Response(
        JSON.stringify({
          error: "Error creating contact",
          details: error.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (contactError) {
      return new Response(
        JSON.stringify({
          error: "Error creating contact",
          details: contactError.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Insert new lead
    let newLead, leadError;
    try {
      const leadResponse = await supabase
        .from("leads")
        .insert([
          {
            contact_id: newContact.id,
            dealership_id: dealershipData.id,
            dealergroup_id: dealershipData.dealergroup_id,
            vehicle_make: vehicle.make || null,
            vehicle_model: vehicle.model || null,
            vehicle_year: vehicle.year || null,
            lead_source: provider?.name || "Unknown Source",
            lead_status: "UNATTENDED",
            comments: `Received via email from ${vendor.name}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      newLead = leadResponse.data;
      leadError = leadResponse.error;

      console.log("Lead creation result:", {
        success: !!newLead,
        error: leadError ? leadError.message : "None",
      });
    } catch (error) {
      console.error("Error creating lead:", error);
      return new Response(
        JSON.stringify({
          error: "Error creating lead",
          details: error.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (leadError) {
      return new Response(
        JSON.stringify({
          error: "Error creating lead",
          details: leadError.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Record this lead as processed to prevent duplicates
    await recordProcessedLead(leadHash, newLead.id, {
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone
      },
      vehicle: {
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model
      },
      vendor: {
        name: vendor.name
      }
    });

    // Update contact with lead
    try {
      await updateContactWithLead(
        newContact.id,
        newLead.id,
        dealershipData.id,
        dealershipData.dealergroup_id
      );
      console.log("Contact updated with lead successfully");
    } catch (error) {
      console.error("Error updating contact with lead:", error);
      // Continue anyway, this is not critical
    }

    // Insert lead activity
    try {
      const activityResponse = await supabaseService
        .from("leadactivity")
        .insert([
          {
            lead_id: newLead.id,
            action: "lead_created",
            user_id: "88a68897-54d3-4bf1-903e-975b7cb277f0", // Consider making this configurable
            timestamp: new Date().toISOString(),
            description: `Lead created from ${vendor.name}`,
          },
        ]);

      const activityError = activityResponse.error;

      console.log("Lead activity creation result:", {
        success: !activityError,
        error: activityError ? activityError.message : "None",
      });

      if (activityError) {
        console.error("Error logging lead activity:", activityError);
      }
    } catch (error) {
      console.error("Error creating lead activity:", error);
    }

    // Insert into unattendedleads
    let newUnattendedLead, unattendedLeadError;
    try {
      // Calculate response deadline (e.g., 24 hours from now)
      const responseDeadline = new Date();
      responseDeadline.setHours(responseDeadline.getHours() + 24);
      
      const unattendedResponse = await supabase
        .from("unattendedleads")
        .insert([
          {
            lead_id: newLead.id,
            contact_id: newContact.id,
            dealership_id: dealershipData.id,
            created_at: new Date().toISOString(),
            claimed_by: null,
            claimed_at: null,
            response_deadline: responseDeadline.toISOString(),
          },
        ])
        .select()
        .single();

      newUnattendedLead = unattendedResponse.data;
      unattendedLeadError = unattendedResponse.error;

      console.log("Unattended lead creation result:", {
        success: !!newUnattendedLead,
        error: unattendedLeadError ? unattendedLeadError.message : "None",
      });
    } catch (error) {
      console.error("Error creating unattended lead:", error);
      return new Response(
        JSON.stringify({
          error: "Error creating unattended lead",
          details: error.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (unattendedLeadError) {
      console.error(
        "Error inserting into unattendedleads:",
        unattendedLeadError
      );
      return new Response(
        JSON.stringify({
          error: "Error creating unattended lead",
          details: unattendedLeadError.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Send email notification
    try {
      console.log("Preparing to send email notifications");

      // First, fetch users who should receive lead emails
      const { data: leadNotificationUsers, error: usersError } =
        await supabaseService
          .from("lead_notifications")
          .select("user_id")
          .eq("receive_leads", true);

      if (usersError || !leadNotificationUsers) {
        console.error("Error fetching lead notification users:", usersError);
        throw new Error("Failed to fetch users for notifications");
      }

      // Extract user IDs
      const userIds = leadNotificationUsers.map((entry) => entry.user_id);

      if (userIds.length === 0) {
        console.warn("No users found for lead notifications.");
      } else {
        // Now fetch their `primary_email` from the `users` table
        const { data: users, error: emailError } = await supabase
          .from("users")
          .select("primary_email")
          .in("id", userIds);

        if (emailError || !users) {
          console.error("Error fetching user emails:", emailError);
          throw new Error("Failed to fetch user emails");
        }

        // Extract recipient emails
        const emailRecipients = users
          .map((user) => user.primary_email)
          .filter(Boolean);

        const emailSubject = `New Hot Lead - ${dealershipData.dealership_name}`;

        const templateData = {
          dealership: dealershipData.dealership_name,
          leadName: `${newContact.first_name} ${newContact.last_name}`,
          source: `${newLead.lead_source}`,
          requestType: `${newContact.first_name} ${newContact.last_name}`,
          stockNumber: "N/A",
          preferred_language: "English",
          dateCreated: new Date().toLocaleString(),
          preferred_contactMethod: newContact.preferred_contact || "Email",
          availableContactMethods: newContact.primary_email ? 
            (newContact.mobile_phone ? "Email, Phone" : "Email") : 
            (newContact.mobile_phone ? "Phone" : "None"),
          vehicle_year: vehicle.year || "Unknown",
          make: vehicle.make || "Unknown",
          model: vehicle.model || "Unknown",
          trim: vehicle.trim || "Unknown",
          stockType: "New",
          quoteInterest: "Yes",
          exteriorColor: vehicle.colors?.exterior || "Unknown",
          interiorColor: vehicle.colors?.interior || "Unknown",
          transmissionName: vehicle.transmission || "Unknown",
          notes: adf.prospect.comments || "No comments provided",
          preferred_contactTime: "Not specified",
          respondByEmailLink: `https://www.baxter-projects.com/crm/respond-lead/${newLead.id}`,
        };

        for (const recipient of emailRecipients) {
          const emailSent = await sendEmail(
            recipient,
            emailSubject,
            templateData
          );
          console.log(`Email to ${recipient}: ${emailSent ? "sent" : "failed"}`);
        }
      }
    } catch (error) {
      console.error("Error in email notification process:", error);
      // Continue anyway, email failure shouldn't stop the process
    }

    console.log("ADF lead processed successfully");
    return new Response(
      JSON.stringify({
        message: "ADF lead processed successfully",
        lead: newLead,
        hash: leadHash
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing ADF lead:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process ADF lead.",
        details: error.message,
        stack: error.stack,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
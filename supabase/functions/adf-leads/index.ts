import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { parseStringPromise } from "https://esm.sh/xml2js";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Function to send email using SendGrid
const sendEmail = async (to: string, subject: string, templateData: Record<string, string>) => {
  const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
  const SENDER_EMAIL = Deno.env.get("SENDER_EMAIL");
  const TEMPLATE_ID = Deno.env.get("SENDGRID_TEMPLATE_ID");

  if (!SENDGRID_API_KEY || !SENDER_EMAIL || !TEMPLATE_ID) {
    throw new Error("Missing environment variables.");
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

  return response.json();
};

// Function to update the contact with lead details
const updateContactWithLead = async (
  contact_id: string,
  lead_id: string,
  dealership_id: string,
  dealergroup_id: string,
) => {
  try {
    // Fetch the current contact data
    const { data: contactData, error: fetchError } = await supabase
      .from("contacts")
      .select("*")
      .eq("id", contact_id)
      .single();

    if (fetchError) throw fetchError;

    // Update the contact with the new lead ID, dealership ID, and dealer group ID
    const updatedContact = {
      ...contactData,
      leads: [...(contactData.leads || []), lead_id],
      dealership_id,
      dealergroup_id,
    };

    // Save the updated contact
    const { data: updatedData, error: updateError } = await supabase
      .from("contacts")
      .update(updatedContact)
      .eq("id", contact_id)
      .select()
      .single();

    if (updateError) throw updateError;

    console.log("Contact updated successfully:", updatedData);
    return updatedData;
  } catch (error) {
    console.error("Error updating contact:", error);
    throw error;
  }
};

serve(async (req) => {
  try {
    // Log request details
    console.log("Request Details:", {
      method: req.method,
      contentType: req.headers.get("content-type"),
      contentLength: req.headers.get("content-length"),
    });

    // Allow only POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { "Content-Type": "application/json" } },
      );
    }

    // Test Supabase connection
    console.log("Testing Supabase connection...");
    const { data: connectionTest, error: connectionError } = await supabase
      .from("dealerships")
      .select("count")
      .single();

    console.log("Connection test result:", {
      success: !!connectionTest,
      error: connectionError,
    });

    if (connectionError) {
      console.error("Supabase connection failed:", connectionError);
      return new Response(
        JSON.stringify({ error: "Database connection failed" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    // Fetch all dealerships for debugging
    const { data: allDealerships, error: dealershipsError } = await supabase
      .from("dealerships")
      .select("id, dealership_name");

    console.log("Available dealerships:", {
      count: allDealerships?.length,
      names: allDealerships?.map((d) => d.name),
      error: dealershipsError,
    });

    // Read raw XML body
    const rawBody = await req.text();
    console.log("Raw body length:", rawBody.length);
    console.log("Raw body preview:", rawBody.substring(0, 200));

    if (!rawBody || !rawBody.includes("<adf>")) {
      console.error("Invalid ADF request body:", rawBody);
      return new Response(
        JSON.stringify({ error: "Invalid ADF request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Parse XML
    console.log("Attempting to parse XML...");
    const result = await parseStringPromise(rawBody, { explicitArray: false });
    console.log("XML parsed successfully:", {
      hasAdf: !!result.adf,
      hasProspect: !!result.adf?.prospect,
      structure: JSON.stringify(result, null, 2),
    });

    const adf = result.adf;
    if (!adf) {
      return new Response(
        JSON.stringify({ error: "Missing <adf> element" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const prospect = adf.prospect;
    if (!prospect) {
      return new Response(
        JSON.stringify({ error: "Missing prospect element" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Log extracted data
    const customer = prospect.customer?.contact;
    const vehicle = prospect.vehicle;
    const vendor = prospect.vendor;

    console.log("Extracted data:", {
      hasCustomer: !!customer,
      hasVehicle: !!vehicle,
      hasVendor: !!vendor,
      customerDetails: customer,
      vehicleDetails: vehicle,
      vendorDetails: vendor,
    });

    if (!customer || !vehicle || !vendor) {
      console.error("Invalid ADF XML format:", result);
      return new Response(
        JSON.stringify({ error: "Invalid ADF XML format." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Dealership search
    const dealership_name = vendor.name.trim();
    console.log(`Searching for dealership: "${dealership_name}"`);

    const { data: dealershipData, error: dealershipError } = await supabase
      .from("dealerships")
      .select("*")
      .ilike("dealership_name", dealership_name)
      .limit(1)
      .single();

    console.log("Dealership search result:", {
      found: !!dealershipData,
      error: dealershipError,
      searchedName: dealership_name,
      result: dealershipData,
    });

    if (dealershipError || !dealershipData) {
      console.error(
        `Dealership not found for name: "${dealership_name}"`,
        dealershipError,
      );
      return new Response(
        JSON.stringify({
          error: `Dealership "${dealership_name}" not found.`,
          availableDealerships: allDealerships?.map((d) => d.name),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Extract Contact Information
    const first_name = customer.name?.first || "Unknown";
    const last_name = customer.name?.last || "Unknown";
    const primary_email = customer.email || null;
    const mobile_phone = customer.phone || "Unknown";
    const street_address = customer.address?.street || null;
    const city = customer.address?.city || null;
    const province = customer.address?.regioncode || null;
    const postal_code = customer.address?.postal_code || null;
    const country = customer.address?.country || null;

    // Extract Vehicle Information
    const vehicleMake = vehicle.make || null;
    const vehicleModel = vehicle.model || null;
    const vehicleYear = vehicle.year || null;

    // Create a new contact
    const { data: newContact, error: createContactError } = await supabase
      .from("contacts")
      .insert([{
        first_name,
        last_name,
        primary_email,
        mobile_phone,
        street_address,
        city,
        province,
        postal_code,
        country,
        preferred_contact: "email",
      }])
      .select()
      .single();

    if (createContactError) {
      console.error("Error creating contact:", createContactError);
      return new Response(
        JSON.stringify({ error: "Error creating contact" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    // Create a new lead
    const { data: newLead, error: newLeadError } = await supabase
      .from("leads")
      .insert([{
        contact_id: newContact.id,
        dealership_id: dealershipData.id,
        dealergroup_id: dealershipData.dealergroup_id,
        vehicleMake,
        vehicleModel,
        vehicleYear,
        leadSource: "ADF",
        leadStatus: "UNATTENDED",
        comments: `Received from ${vendor.name}`,
      }])
      .select()
      .single();

    if (newLeadError) {
      console.error("Error inserting lead:", newLeadError);
      return new Response(
        JSON.stringify({ error: newLeadError.message }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    // Update the contact with the new lead ID, dealership ID, and dealer group ID
    try {
      await updateContactWithLead(
        newContact.id,
        newLead.id,
        dealershipData.id,
        dealershipData.dealergroup_id,
      );
    } catch (error) {
      console.error("Error updating contact:", error);
      return new Response(
        JSON.stringify({ error: "Failed to update contact with lead details" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    // Insert into the unattendedleads table
    const { data: newUnattendedLead, error: unattendedLeadError } = await supabase
      .from("unattendedleads")
      .insert([{
        lead_id: newLead.id,
        contact_id: newContact.id,
        created_at: new Date().toISOString(),
        claimedBy: null,
        claimedAt: null,
        responseDeadline: null,
      }])
      .select()
      .single();

    if (unattendedLeadError) {
      console.error("Error inserting into unattendedleads:", unattendedLeadError);
      return new Response(
        JSON.stringify({ error: unattendedLeadError.message }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    // Send email notification
    try {
      const emailRecipients = ["brucechafe@gmail.com", "user2@example.com"];
      const emailSubject = `New Hot Lead - ${dealershipData.dealership_name}`; // Dynamic subject line

      const templateData = {
        dealership: dealershipData.dealership_name, // Add dealership name here
        leadName: `${newContact.first_name} ${newContact.last_name}`,
        source: `${newLead.leadSource}`,
        requestType: `${newContact.first_name} ${newContact.last_name}`,
        stockNumber: "Stock Number",
        preferred_language: "English",
        dateCreated: new Date().toLocaleString(),
        preferred_contactMethod: "Email",
        availableContactMethods: "Email",
        vehicleYear: vehicleYear,
        modelCode: "SXACP",
        make: vehicleMake,
        model: vehicleModel,
        trim: "Convenience",
        stockType: "New",
        quoteInterest: "Yes",
        exteriorColor: "Crystal Black Silica - 4S",
        interiorColor: "Grey Cloth - 70",
        transmissionName: "Automatic",
        notes: "Pricing:",
        pricing: "Province: NL",
        msrp: "$29,495",
        type: "Cash",
        customerComments: "Preferred Contact Time: EVENING",
        preferred_contactTime: "EVENING",
        futureMarketingMaterial: "Not Provided",
        respondByTextLink: "https://example.com/respond-by-text",
        respondByEmailLink: `/crm/respond-lead/${newLead.id}`,
        respondByPhoneLink: "https://example.com/respond-by-phone",
        nonSalesLeadsLink: "https://example.com/non-sales-leads",
        virtualShowroomLink: "https://example.com/virtual-showroom",
        closedForHolidayLink: "https://example.com/closed-for-holiday",
        restoreOpenHoursLink: "https://example.com/restore-open-hours",
        contactSupportLink: "https://example.com/contact-support",
        termsOfUseLink: "https://example.com/terms-of-use",
        totalLeadsResponded: "0",
        averageResponseTime: "N/A",
        leadsReceived: "5",
        leadsUnattended: "1",
        leadResponseRatio: "80%",
        leadsResponded: "4",
        emailResponses: "4",
        phoneResponses: "0",
        textResponses: "0",
        nonSalesLeads: "1",
        dealershipResponseTime: "2 Min",
      };

      for (const recipient of emailRecipients) {
        await sendEmail(recipient, emailSubject, templateData);
      }
    } catch (error) {
      console.error("Error sending email notification:", error);
    }

    return new Response(
      JSON.stringify({ message: "ADF lead processed successfully", lead: newLead }),
      { status: 201, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error processing ADF lead:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process ADF lead.",
        details: error.message,
        stack: error.stack,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
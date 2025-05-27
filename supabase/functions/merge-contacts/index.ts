import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS, POST",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

// ✅ Middleware: Validate Authorization
async function verifyAuth(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: corsHeaders(),
    });
  }

  const token = authHeader.replace("Bearer ", "").trim();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401,
      headers: corsHeaders(),
    });
  }

  return data.user; // Return authenticated user
}

// ✅ Handle Merge Contacts
async function mergeContacts(primaryContact: any, duplicateContact: any) {
  console.log("Merging contacts:", primaryContact.id, duplicateContact.id);

  try {
    // ✅ Ensure leads is an array
    const primaryLeads = Array.isArray(primaryContact.leads)
      ? primaryContact.leads
      : typeof primaryContact.leads === "string"
      ? primaryContact.leads.replace(/[{}]/g, "").split(",").filter(Boolean) // Handle PostgreSQL array format
      : [];

    const duplicateLeads = Array.isArray(duplicateContact.leads)
      ? duplicateContact.leads
      : typeof duplicateContact.leads === "string"
      ? duplicateContact.leads.replace(/[{}]/g, "").split(",").filter(Boolean)
      : [];

    console.log("Parsed leads:", primaryLeads, duplicateLeads);

    const mergedData = {
      primary_email: primaryContact.primary_email || duplicateContact.primary_email,
      secondary_email: Array.from(
        new Set([primaryContact.secondary_email, duplicateContact.primary_email, duplicateContact.secondary_email].filter(Boolean))
      ),
      mobile_phone: primaryContact.mobile_phone || duplicateContact.mobile_phone,
      total_visits: (primaryContact.total_visits || 0) + (duplicateContact.total_visits || 0),

      // ✅ Store as PostgreSQL array format
      leads: `{${Array.from(new Set([...primaryLeads, ...duplicateLeads])).join(",")}}`,
      updated_at: new Date().toISOString(),
    };

    console.log("Updating primary contact:", primaryContact.id, mergedData);

    // ✅ Update primary contact
    const { error: updateError } = await supabase
      .from("contacts")
      .update(mergedData)
      .eq("id", primaryContact.id)
      .select();

    if (updateError) {
      console.error("Error updating primary contact:", updateError);
      throw updateError;
    }

    console.log("Archiving duplicate contact:", duplicateContact.id);

    // ✅ Mark duplicate contact as merged
    const { error: mergeError } = await supabase
      .from("contacts")
      .update({ merged_into: primaryContact.id })
      .eq("id", duplicateContact.id)
      .select();

    if (mergeError) {
      console.error("Error archiving duplicate contact:", mergeError);
      throw mergeError;
    }

    return new Response(JSON.stringify({ message: "Merge successful" }), { status: 200, headers: corsHeaders() });
  } catch (error) {
    console.error("Unexpected error merging contacts:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: corsHeaders() });
  }
}

// Serve Function
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (req.method === "POST") {
    const user = await verifyAuth(req);
    if (!(user instanceof Object)) return user; // Return 401 response if invalid

    try {
      const { primaryContact, duplicateContact } = await req.json();
      if (!primaryContact || !duplicateContact) {
        console.error("Invalid request body:", primaryContact, duplicateContact);
        return new Response(JSON.stringify({ error: "Invalid request data" }), { status: 400, headers: corsHeaders() });
      }

      return await mergeContacts(primaryContact, duplicateContact);
    } catch (error) {
      console.error("Error parsing request:", error);
      return new Response(JSON.stringify({ error: "Invalid request format" }), { status: 400, headers: corsHeaders() });
    }
  }

  return new Response("Invalid request", { status: 400, headers: corsHeaders() });
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

// the role_id for your Group Admin
const GROUP_ADMIN_ROLE_ID = "721721b4-3bc1-48a0-8c14-0432fa94ad8c";

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const body = await req.json();
    const { name, dealerGroupId, dealergroup_id } = body;
    const dgId = dealerGroupId || dealergroup_id;
    if (!name?.trim() || !dgId)
      return new Response(
        JSON.stringify({ error: "Name and dealergroup_id are required" }),
        { status: 400, headers: corsHeaders }
      );

    // validate the bearer token
    const authToken = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!authToken)
      return new Response(
        JSON.stringify({ error: "Authorization token required" }),
        { status: 401, headers: corsHeaders }
      );

    const { data: { user }, error: userError } =
      await supabase.auth.getUser(authToken);
    if (userError || !user)
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: corsHeaders }
      );

    // 1️⃣ Create the new dealership
    const { data: dealership, error: insertError } = await supabase
      .from("dealerships")
      .insert({
        dealership_name: name,
        dealergroup_id: dgId,
        date_created: new Date().toISOString(),
      })
      .select()
      .maybeSingle();

    if (insertError || !dealership) {
      console.error("Database Error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create dealership", details: insertError?.message }),
        { status: 500, headers: corsHeaders }
      );
    }

    // 2️⃣ Find all Group Admins in that dealer group
    const { data: admins, error: adminErr } = await supabase
      .from("users")
      .select("id")
      .eq("dealergroup_id", dgId)
      .eq("role_id", GROUP_ADMIN_ROLE_ID);

    if (adminErr) {
      console.warn("Failed to fetch group admins:", adminErr);
    } else if (admins?.length) {
      // 3️⃣ Insert into user_dealerships
      const assignments = admins.map((u) => ({
        user_id: u.id,
        dealership_id: dealership.id,
        is_primary: false,
        role_id: GROUP_ADMIN_ROLE_ID,
        // created_at will default to now if your column has DEFAULT
      }));

      const { error: assignErr } = await supabase
        .from("user_dealerships")
        .insert(assignments);

      if (assignErr) {
        console.error("Failed to assign users to dealership:", assignErr);
      }
    }

    // 4️⃣ Return the new dealership
    return new Response(
      JSON.stringify({ dealership }),
      { status: 201, headers: corsHeaders }
    );

  } catch (error) {
    console.error("Unexpected Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});

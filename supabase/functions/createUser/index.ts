import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL or key is missing");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.json();
    const {
      email,
      password,
      first_name,
      last_name,
      dealergroup_id,
      department_id,
      job_title_id,
      role_id,
      dealership_id,
    } = body;

    // Create user
    const { data: user, error: userCreationError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        first_name,
        last_name,
        dealergroup_id,
        department_id,
        job_title_id,
        role_id,
      },
    });

    if (userCreationError) {
      console.error("User Creation Error:", userCreationError);
      throw userCreationError;
    }

    // Insert into users table
    const { error: insertUserError } = await supabase.from("users").insert([
      {
        id: user?.user?.id,
        primary_email: email,
        first_name,
        last_name,
        dealergroup_id,
        department_id,
        job_title_id,
        role_id,
      },
    ]);

    if (insertUserError) {
      console.error("User Insert Error:", insertUserError);
      throw insertUserError;
    }

    // Insert into user_dealerships
    const { error: dealershipError } = await supabase
      .from("user_dealerships")
      .insert([
        {
          user_id: user?.user?.id,
          dealership_id,
          is_primary: true,
          role_id,
        },
      ]);

    if (dealershipError) {
      console.error("User Dealership Insert Error:", dealershipError);
      throw dealershipError;
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err) {
    console.error("❌ Comprehensive Error:", err);
    return new Response(
      JSON.stringify({ 
        error: err.message || "Unknown error",
        details: err.details || null 
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});
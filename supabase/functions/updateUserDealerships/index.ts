import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS, POST",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const authToken = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!authToken) {
      return new Response(JSON.stringify({ error: "Unauthorized: No token provided" }), {
        status: 401,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: { headers: { Authorization: `Bearer ${authToken}` } },
      }
    );

    const { userId, dealershipIds, primary_dealership_id } = await req.json();

    if (!userId || !dealershipIds?.length || !primary_dealership_id) {
      return new Response(JSON.stringify({ error: "Missing required parameters" }), {
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    // Delete old dealerships
    await supabase.from("UserDealerships").delete().eq("userId", userId);

    // Insert new dealerships
    const newAssignments = dealershipIds.map((dealership_id) => ({
      userId: userId,
      dealership_id: dealership_id,
      is_primary: dealership_id === primary_dealership_id,
    }));

    const { error } = await supabase.from("UserDealerships").insert(newAssignments);
    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});

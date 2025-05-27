import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Load environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

serve(async (req) => {
  try {
    const { error } = await supabase.rpc("refresh_lead_response_times");

    if (error) {
      console.error("Error refreshing Materialized View:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    console.log("Materialized View refreshed successfully.");
    return new Response(JSON.stringify({ message: "Materialized View refreshed" }), { status: 200 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), { status: 500 });
  }
});

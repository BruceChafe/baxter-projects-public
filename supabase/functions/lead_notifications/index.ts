import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST", "Access-Control-Allow-Headers": "Content-Type" },
    });
  }

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("users")
      .select(`
        id,
        email,
        first_name,
        last_name,
        dealership_id,
        dealerships(dealership_name),
        lead_notifications(receive_leads)
      `)
      .leftJoin("lead_notifications", "users.id", "lead_notifications.user_id")
      .leftJoin("dealerships", "users.dealership_id", "dealerships.id");

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  if (req.method === "POST") {
    const { user_id, receive_leads, dealership_id } = await req.json();

    const { error } = await supabase
      .from("lead_notifications")
      .upsert({ user_id, receive_leads, dealership_id });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ message: "Updated successfully" }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  return new Response("Invalid request", { status: 400, headers: { "Content-Type": "application/json" } });
});
